import NumberInput from "@/components/custom/number-input"
import Phone from "@/components/custom/phone"
import type { ColumnDef } from "@tanstack/react-table"
import type { JSX } from "react"
import { formatDateTime } from "./date"
import { formatNumber } from "./format-number"
import { getFlooredNumber } from "./get-floored-number"
import { getNumber } from "./get-number"
import { cn } from "./shadcn"

export const textColumn = <T,>(
    accessorKey: keyof T,
    header: string,
    other?: Omit<ColumnDef<T>, "accessorKey" | "header">,
): ColumnDef<T> => ({
    ...other,
    accessorKey,
    header,
})

export const customColumn = <T,>(
    header: string,
    cell: (props: { row: { original: T } }) => JSX.Element,
): ColumnDef<T> => ({
    header,
    cell,
})

export const columnAction = <T,>(
    header: string,
    accessorKey: "action",
    cell: (props: { row: { original: T } }) => JSX.Element,
): ColumnDef<T> => ({
    header,
    accessorKey,
    cell,
})

type MoneyColumnProps = {
    header?: string
    className?: string
    isShowZero?: boolean
    disableFlooring?: boolean
}
export const moneyColumn = <T,>(
    accessorKey: keyof T,
    {
        header = "Balance",
        className = "",
        isShowZero = true,
        disableFlooring = false,
    }: MoneyColumnProps = {},
): ColumnDef<T> => ({
    accessorKey,
    header,
    cell: ({ row: { original } }) => {
        const balance = getNumber(original[accessorKey])

        if (!isShowZero && !balance) return null
        if (isShowZero && !balance) return "0"

        const defaultClassName = cn(
            balance > 0 && "text-green-500",
            balance < 0 && "text-red-500",
        )

        const formattedValue = formatNumber(
            disableFlooring ? balance : getFlooredNumber(balance),
            { isShowZero, allowNegative: true, prefix: "$" },
        )

        return (
            <span className={cn(defaultClassName, className)}>
                {formattedValue}
            </span>
        )
    },
})

export const phoneColumn = <T,>(
    accessor: keyof T,
    options?: { header?: string; isLink: boolean },
): ColumnDef<T> => ({
    header: options?.header || "Telefon",
    cell: ({ row: { original } }) => {
        const phone = original[accessor] as string
        return <Phone value={phone} isLink={options?.isLink} />
    },
})

export const dateTimeColumn = <T,>(
    accessorKey: keyof T,
    header: string,
): ColumnDef<T> => {
    return {
        accessorKey,
        header,
        cell: ({ row }) => {
            const date = row.original[accessorKey] as string
            return formatDateTime(date)
        },
        meta: {
            tdClassName: "font-medium text-sm",
        },
    }
}

export const numberColumn = <T,>(
    accessorKey: keyof T,
    header = " ",
): ColumnDef<T> => ({
    accessorKey,
    header,
    cell: ({ row: { original } }) => {
        const num = Number(original[accessorKey])
        return <NumberInput displayType="text" value={num} />
    },
})
