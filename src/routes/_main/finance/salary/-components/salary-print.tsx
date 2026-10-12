import { formatNumber } from "@/lib/utils/format-number"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import type { PayrollRow } from "../-types"

const num = (v: unknown) =>
    Number(v) ? formatNumber(v, { decimalScale: 2 }) : "—"

type Totals = {
    base: number
    advance: number
    penalty: number
    bonus: number
    accrued: number
}

type Props = {
    rows: PayrollRow[]
    totals: Totals
    monthLabel: string
    payoutDate: string
}

/**
 * Print-only payroll sheet. Rendered straight into <body> and shown only by
 * `@media print`, while the rest of the app is hidden — so the printout holds
 * just the table, landscape, with the header repeated on every page.
 */
export default function SalaryPrint({
    rows,
    totals,
    monthLabel,
    payoutDate,
}: Props) {
    const { t } = useTranslation()

    const head: { label: string; right?: boolean }[] = [
        { label: "#" },
        { label: t("table.name") },
        { label: t("salary.department") },
        { label: t("salary.position") },
        { label: t("salary.code"), right: true },
        { label: t("salary.baseSalary"), right: true },
        { label: t("salary.rateUnit") },
        { label: t("salary.norm"), right: true },
        { label: t("salary.worked"), right: true },
        { label: t("salary.advance"), right: true },
        { label: t("salary.penalty"), right: true },
        { label: t("salary.bonus"), right: true },
        { label: t("salary.accrued"), right: true },
        { label: t("table.comment") },
        { label: t("salary.posted") },
    ]

    return createPortal(
        <div className="salary-print">
            <style>{PRINT_CSS}</style>
            <div className="sp-title">
                <h1>
                    {t("salary.title")} — {monthLabel}
                </h1>
                {payoutDate && (
                    <span>
                        {t("salary.payoutDate")}: {payoutDate}
                    </span>
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        {head.map((h) => (
                            <th key={h.label} className={h.right ? "r" : ""}>
                                {h.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.id}>
                            <td>{i + 1}</td>
                            <td className="b wrap">{row.full_name}</td>
                            <td className="wrap">{row.department ?? "—"}</td>
                            <td className="wrap">{row.position ?? "—"}</td>
                            <td className="r">{row.code ?? "—"}</td>
                            <td className="r">{num(row.base_salary)}</td>
                            <td>{t(`salary.unit_${row.rate_unit}`)}</td>
                            <td className="r">{num(row.norm)}</td>
                            <td className="r">{num(row.worked)}</td>
                            <td className="r">{num(row.advance_total)}</td>
                            <td className="r">{num(row.penalty_total)}</td>
                            <td className="r">{num(row.bonus_total)}</td>
                            <td className="r b">{num(row.accrued)}</td>
                            <td className="wrap">{row.comment || ""}</td>
                            <td className="c">{row.posted ? "✓" : ""}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="b">
                            {t("salary.total")}
                        </td>
                        <td className="r">{num(totals.base)}</td>
                        <td colSpan={3} />
                        <td className="r">{num(totals.advance)}</td>
                        <td className="r">{num(totals.penalty)}</td>
                        <td className="r">{num(totals.bonus)}</td>
                        <td className="r">{num(totals.accrued)}</td>
                        <td colSpan={2} />
                    </tr>
                </tfoot>
            </table>
        </div>,
        document.body,
    )
}

const PRINT_CSS = `
@media screen {
    .salary-print { display: none; }
}
@media print {
    @page { size: A4 landscape; margin: 8mm; }
    body > *:not(.salary-print) { display: none !important; }
    html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
    .salary-print {
        display: block;
        color: #000;
        font-size: 8pt;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .salary-print .sp-title {
        display: flex; justify-content: space-between; align-items: baseline;
        margin-bottom: 4mm;
    }
    .salary-print h1 { font-size: 13pt; font-weight: 700; margin: 0; }
    .salary-print table { width: 100%; border-collapse: collapse; }
    .salary-print thead { display: table-header-group; }
    .salary-print tfoot { display: table-row-group; }
    .salary-print tr { break-inside: avoid; page-break-inside: avoid; }
    .salary-print th, .salary-print td {
        border: 1px solid #999;
        padding: 1mm 1.2mm;
        text-align: left;
        vertical-align: top;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
    .salary-print th { background: #eee; font-weight: 600; white-space: normal; }
    .salary-print tfoot td { background: #f3f3f3; font-weight: 700; }
    .salary-print .r { text-align: right; }
    .salary-print .c { text-align: center; }
    .salary-print .b { font-weight: 600; }
    .salary-print .wrap { white-space: normal; }
}
`
