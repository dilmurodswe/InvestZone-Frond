export type TCellProps = {
    fixed?: "left" | "right"
    fixedPosition?: number
}

export interface IPaginationProps<TData> {
    count?: number
    paginationClassName?: string
    pageKey?: string
    pageSizeKey?: string
    pageSize?: number
    data?: TData[]
    isLoading?: boolean
    disableSetPageSize?: boolean
}
