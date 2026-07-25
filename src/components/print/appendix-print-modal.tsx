import Modal from "@/components/custom/modal"
import DatepickerField from "@/components/form/datepicker-field"
import UncontrolledInput from "@/components/form/uncontrolled-input"
import UncontrolledTextarea from "@/components/form/uncontrolled-textarea"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { downloadPdf, printPdf } from "@/lib/pdf/output"
import type {
    AppendixDocumentFields,
    AppendixItem,
    AppendixTemplateFields,
} from "@/lib/print/appendix-types"
import { useAppendixTemplate } from "@/lib/print/use-appendix-template"
import { Download, Printer, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

/** Hujjatning o'zidan (buyurtma yoki otgruzka) keladigan qism. */
export type AppendixSeed = AppendixDocumentFields & {
    items: AppendixItem[]
    total: number
    currency: string
}

type FormValues = AppendixDocumentFields & AppendixTemplateFields

type Props = {
    modalKey: string
    seed: AppendixSeed | null
    /** `.pdf` qo'shilmagan fayl nomi. */
    fileName: string
}

export default function AppendixPrintModal({ modalKey, seed, fileName }: Props) {
    return (
        <Modal
            modalKey={modalKey}
            title={null}
            wrapperClassname="md:w-[1000px]! md:max-w-none"
            className="min-w-[960px]!"
        >
            {seed && (
                <AppendixPrintForm
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

function AppendixPrintForm({
    modalKey,
    seed,
    fileName,
}: Props & { seed: AppendixSeed }) {
    const { t } = useTranslation()
    const { closeModal } = useModal(modalKey)
    const { template, setTemplate, reset } = useAppendixTemplate()
    const [busy, setBusy] = useState<"print" | "download" | null>(null)

    const form = useForm<FormValues>({ values: { ...seed, ...template } })

    const submit = async (mode: "print" | "download", values: FormValues) => {
        // Shablon qismi keyingi hujjatlarda ham ishlatiladi.
        const {
            seller,
            manufacturer,
            direction,
            deliveryTerms,
            goodsDescription,
            specsLeft,
            specsRight,
            packaging,
            marking,
            paymentTermsText,
            specialTerms,
            defaultUnit,
        } = values
        setTemplate({
            seller,
            manufacturer,
            direction,
            deliveryTerms,
            goodsDescription,
            specsLeft,
            specsRight,
            packaging,
            marking,
            paymentTermsText,
            specialTerms,
            defaultUnit,
        })

        try {
            // jsPDF ~380 KB — u faqat chop etish bosilganda yuklansin.
            const { buildAppendixPdf } = await import("@/lib/print/appendix-pdf")
            const doc = await buildAppendixPdf({
                ...values,
                items: seed.items.map((item) => ({
                    ...item,
                    unit: item.unit || defaultUnit,
                })),
                total: seed.total,
                currency: seed.currency,
            })
            if (mode === "download") downloadPdf(doc, fileName)
            else printPdf(doc)
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

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1"
        >
            <div className="flex items-center justify-between gap-4">
                <CardTitle>{t("print.appendix")}</CardTitle>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        reset()
                        toast.success(t("print.templateReset"))
                    }}
                >
                    <RotateCcw className="w-4 h-4" />
                    {t("print.resetTemplate")}
                </Button>
            </div>

            <Section title={t("print.sectionDocument")}>
                <div className="grid grid-cols-3 gap-4">
                    <DatepickerField
                        methods={form}
                        name="shipmentDate"
                        label="Дата отправки"
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
                        name="appendixNumber"
                        label="Приложение №"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="appendixVersion"
                        label="Версия"
                        optional
                    />
                    <DatepickerField
                        methods={form}
                        name="deliveryDeadline"
                        label="Срок поставки по"
                        optional
                    />
                </div>
            </Section>

            <Section title={t("print.sectionParties")}>
                <UncontrolledInput
                    methods={form}
                    name="buyerName"
                    label="Покупатель"
                    optional
                />
                <div className="grid grid-cols-2 gap-4">
                    <UncontrolledTextarea
                        methods={form}
                        name="seller"
                        label="Поставщик"
                        rows={4}
                        optional
                    />
                    <UncontrolledTextarea
                        methods={form}
                        name="consignee"
                        label="Грузополучатель"
                        rows={4}
                        optional
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <UncontrolledInput
                        methods={form}
                        name="manufacturer"
                        label="Производитель"
                        optional
                    />
                    <UncontrolledInput
                        methods={form}
                        name="executor"
                        label="Исполнитель"
                        optional
                    />
                </div>
            </Section>

            <Section title={t("print.sectionDelivery")}>
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
                        name="defaultUnit"
                        label="Ед. изм"
                        optional
                    />
                </div>
            </Section>

            <Section title={t("print.sectionGoods")}>
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
            </Section>

            <Section title={t("print.sectionTerms")}>
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
                        name="paymentTermsTitle"
                        label="Условие оплаты"
                        optional
                    />
                </div>
                <UncontrolledTextarea
                    methods={form}
                    name="paymentTermsText"
                    label="Текст условия оплаты"
                    rows={3}
                    optional
                />
                <UncontrolledTextarea
                    methods={form}
                    name="specialTerms"
                    label="Особые условия"
                    rows={5}
                    optional
                />
            </Section>

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
