import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatNumber } from "@/lib/utils/format-number"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { PayrollRow } from "../-types"
import { usePaymentTypesQuery } from "../../expence/-hooks/use-payment-types-query"

type Props = {
    row: PayrollRow | null
    onClose: () => void
    onConfirm: (row: PayrollRow, paymentType: number) => Promise<void>
}

/**
 * Ticking «Проведено» books the salary payout as a Расход — this asks which
 * kassa it is paid from and shows the amount that will be booked.
 */
export default function SalaryPostDialog({ row, onClose, onConfirm }: Props) {
    return (
        <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                wrapperClassname="md:max-w-md"
                closeButtonClassName="top-4 right-4 text-foreground [&_svg]:size-5"
            >
                {row && <Inner key={row.id} row={row} onConfirm={onConfirm} />}
            </DialogContent>
        </Dialog>
    )
}

function Inner({
    row,
    onConfirm,
}: {
    row: PayrollRow
    onConfirm: Props["onConfirm"]
}) {
    const { t } = useTranslation()
    const { paymentTypeList } = usePaymentTypesQuery()
    const [kassa, setKassa] = useState<string>("")
    const [saving, setSaving] = useState(false)
    const amount = Number(row.payout_amount || 0)

    const submit = async () => {
        if (!kassa) return
        setSaving(true)
        try {
            await onConfirm(row, Number(kassa))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <DialogHeader className="gap-1 pr-8 text-left">
                <DialogTitle>{t("salary.postTitle")}</DialogTitle>
                <DialogDescription>{row.full_name}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">
                    {t("salary.payoutAmount")}
                </span>
                <span className="text-2xl font-bold tabular-nums text-red-600">
                    {formatNumber(amount, { isShowZero: true })} UZS
                </span>
                <span className="text-xs text-muted-foreground">
                    {t("salary.payoutHint")}
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>{t("finCat.kassa")}</Label>
                <Select value={kassa} onValueChange={setKassa}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("finCat.kassa")} />
                    </SelectTrigger>
                    <SelectContent>
                        {paymentTypeList.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button disabled={!kassa || saving} onClick={submit}>
                {t("salary.postConfirm")}
            </Button>
        </div>
    )
}
