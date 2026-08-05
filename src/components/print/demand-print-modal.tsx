import Modal from "@/components/custom/modal"
import DatepickerField from "@/components/form/datepicker-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { downloadPdf, printPdf } from "@/lib/pdf/output"
import { pickTemplate } from "@/lib/print/appendix-defaults"
import type { AppendixTemplateFields } from "@/lib/print/appendix-types"
import type { DemandDocumentFields, DemandItem } from "@/lib/print/demand-types"
import {
    DEMAND_VARIANTS,
    DEMAND_VARIANT_ORDER,
} from "@/lib/print/demand-variants"
import { useAppendixTemplate } from "@/lib/print/use-appendix-template"
import { useDemandPrintVariant } from "@/lib/print/use-print-variant"
import { cn } from "@/lib/utils/shadcn"
import { Download, Printer, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

/** Otgruzkaning o'zidan keladigan qism. */
export type DemandSeed = DemandDocumentFields & {
    items: DemandItem[]
    total: number
    currency: string
}

type FormValues = DemandDocumentFields & AppendixTemplateFields

type Props = {
    modalKey: string
    seed: DemandSeed | null
    /** Forma nomisiz fayl nomi — odatda hujjat raqami. */
    fileName: string
}

export default function DemandPrintModal({ modalKey, seed, fileName }: Props) {
    return (
        <Modal
            modalKey={modalKey}
            title={null}
            wrapperClassname="md:w-[1000px]! md:max-w-none"
            className="min-w-[960px]!"
        >
            {seed && (
                <DemandPrintForm
                    modalKey={modalKey}
                    seed={seed}
                    fileName={fileName}
                />
            )}
        </Modal>
    )
}

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
                {title}
            </span>
            {children}
        </div>
    )
}

function DemandPrintForm({
    modalKey,
    seed,
    fileName,
}: Props & { seed: DemandSeed }) {
    const { t } = useTranslation()
    const { closeModal } = useModal(modalKey)
    const { variant, setVariant } = useDemandPrintVariant()
    const { templates, setTemplate, reset } = useAppendixTemplate()
    const [busy, setBusy] = useState<"print" | "download" | null>(null)

    const meta = DEMAND_VARIANTS[variant]
    const template = templates[meta.template]

    const form = useForm<FormValues>({
        values: {
            ...seed,
            ...template,
            // «ТТН-Весовая» ning markirovkasi o'zining: shablonni o'zgartirmasdan
            // shu formaga yozib qo'yiladi.
            marking: meta.marking ?? template.marking,
        },
    })

    const submit = async (mode: "print" | "download", values: FormValues) => {
        setTemplate(meta.template, pickTemplate(values))

        try {
            // jsPDF ~380 KB — u faqat chop etish bosilganda yuklansin.
            const { buildDemandPdf } = await import("@/lib/print/demand-pdf")
            const doc = await buildDemandPdf({
                ...values,
                variant,
                items: seed.items.map((item) => ({
                    ...item,
                    unit: item.unit || values.defaultUnit,
                })),
                total: seed.total,
                currency: seed.currency,
            })
            if (mode === "download") {
                downloadPdf(doc, `${meta.fileNamePrefix}-${fileName}`)
            } else printPdf(doc)
            closeModal()
        } catch (error) {
            console.error(error)
            toast.error(t("print.failed"))
        } finally {
            setBusy(null)
        }
    }

    const run = (mode: "print" | "download") => () => {
        setBusy(mode)
        void form.handleSubmit(
            (values) => submit(mode, values),
            () => setBusy(null),
        )()
    }

    // Firma blankidagi ТТН'lardagina tovar tavsifi va ГОСТ'lar chiqadi.
    const letterhead = meta.layout === "ttnLetterhead"
    const transport = meta.layout !== "expenseInvoice"

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1"
        >
            <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        reset(meta.template)
                        toast.success(t("print.templateReset"))
                    }}
                >
                    <RotateCcw className="w-4 h-4" />
                    {t("print.resetTemplate")}
                </Button>
            </div>

            {/* Ettita formani oynani yopmasdan almashtirish mumkin: yuk
                ketayotganda ketma-ket bir nechtasi bosiladi. */}
            <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
                {DEMAND_VARIANT_ORDER.map((id) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setVariant(id)}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                            id === variant ?
                                "bg-background shadow-sm"
                            :   "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {DEMAND_VARIANTS[id].label}
                    </button>
                ))}
            </div>

            <Section title={t("print.sectionDocument")}>
                <div className="grid grid-cols-3 gap-4">
                    <UncontrolledInput
                        methods={form}
                        name="number"
                        label="Накладная №"
                        optional
                    />
                    <DatepickerField
                        methods={form}
                        name="docDate"
                        label="Дата"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="warehouseName"
                        label="Склад"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="contractNumber"
                        label="Контракт №"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="lotNumber"
                        label="Лот №"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="executor"
                        label="Сдал / отпуск произвёл"
                        optional
                    />
                    {letterhead && (
                        <>
                            <UncontrolledInput
                                methods={form}
                                name="appendixNumber"
                                label="Приложение №"
                                optional
                            />
                            <UncontrolledInput
                                methods={form}
                                name="appendixVersion"
                                label="Версия приложения"
                                optional
                            />
                            <DatepickerField
                                methods={form}
                                name="appendixDate"
                                label="Дата приложения"
                                optional
                            />
                        </>
                    )}
                </div>
            </Section>

            <Section title={t("print.sectionParties")}>
                <div className="grid grid-cols-3 gap-4">
                    <UncontrolledInput
                        methods={form}
                        name="buyerName"
                        label="Покупатель"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="buyerInn"
                        label="ИНН покупателя"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="sellerInn"
                        label="ИНН поставщика"
                        optional
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <UncontrolledTextarea
                        methods={form}
                        name="buyerDetails"
                        label="Покупатель — реквизиты одной строкой"
                        rows={3}
                        optional
                    />
                    <UncontrolledTextarea
                        methods={form}
                        name="consignee"
                        label="Грузополучатель"
                        rows={3}
                        optional
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <UncontrolledTextarea
                        methods={form}
                        name="sellerPostal"
                        label="Поставщик — адрес и телефон"
                        rows={2}
                        optional
                    />
                    <div className="flex flex-col gap-4">
                        <UncontrolledInput
                            methods={form}
                            name="sellerShortName"
                            label="Грузоотправитель"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="releaseAllowedBy"
                            label="Отпуск разрешил"
                            optional
                        />
                    </div>
                </div>
                {letterhead && (
                    <UncontrolledTextarea
                        methods={form}
                        name="seller"
                        label="Поставщик — блок реквизитов"
                        rows={4}
                        optional
                    />
                )}
            </Section>

            {transport && (
                <Section title="Перевозка">
                    <div className="grid grid-cols-3 gap-4">
                        <UncontrolledInput
                            methods={form}
                            name="transportType"
                            label="Тип перевозки"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="carModel"
                            label="Автомобиль"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="carNumber"
                            label="Гос. номер"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="carrier"
                            label="Перевозчик"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="driver"
                            label="Водитель"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="waybillNumber"
                            label="К путевому листу"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="loadingPoint"
                            label="Пункт погрузки 1"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="loadingPoint2"
                            label="Пункт погрузки 2"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="unloadingPoint"
                            label="Пункт разгрузки 1"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="unloadingPoint2"
                            label="Пункт разгрузки 2"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="redirection"
                            label="Переадресовка"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="newConsigneeAddress"
                            label="Адрес грузополучателя"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="contractLine"
                            label="По договору"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="cargoDocuments"
                            label="С грузом следуют документы"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="weightMethod"
                            label="Способ определения массы"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="packageKind"
                            label="Вид упаковки"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="placesCount"
                            label="Количество мест"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="cargoClass"
                            label="Класс груза"
                            optional
                        />
                    </div>
                </Section>
            )}

            {letterhead && (
                <Section title={t("print.sectionGoods")}>
                    <div className="grid grid-cols-3 gap-4">
                        <UncontrolledInput
                            methods={form}
                            name="deliveryTerms"
                            label="Условие поставки"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="direction"
                            label="Направление"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="manufacturer"
                            label="Производитель"
                            optional
                        />
                    </div>
                    <UncontrolledTextarea
                        methods={form}
                        name="goodsDescription"
                        label="Описание товара"
                        rows={3}
                        optional
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <UncontrolledTextarea
                            methods={form}
                            name="specsLeft"
                            label="Технические характеристики — слева"
                            rows={5}
                            optional
                        />
                        <UncontrolledTextarea
                            methods={form}
                            name="specsRight"
                            label="Технические характеристики — справа"
                            rows={5}
                            optional
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t("print.specsHint")}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        <UncontrolledInput
                            methods={form}
                            name="packaging"
                            label="Упаковка"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="marking"
                            label="Маркировка"
                            optional
                        />
                        <UncontrolledInput
                            methods={form}
                            name="defaultUnit"
                            label="Ед. изм"
                            optional
                        />
                    </div>
                </Section>
            )}

            <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={run("download")}
                    disabled={!!busy}
                >
                    <Download className="w-4 h-4" />
                    {t("print.download")}
                </Button>
                <Button type="button" onClick={run("print")} disabled={!!busy}>
                    <Printer className="w-4 h-4" />
                    {t("print.print")}
                </Button>
            </div>
        </form>
    )
}
