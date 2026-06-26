import LogoLoader from "@/components/ui/logo-loader"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    type TableProps,
    TableRow,
} from "@/components/ui/table"
import { SEARCH_PARAMS } from "@/lib/constants/search-params"
import { cn } from "@/lib/utils/shadcn"
import { useSearch } from "@tanstack/react-router"
import "@tanstack/react-table"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type Row,
    type RowData,
    useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { ReactNode } from "react"
import { useRef } from "react"
import TableActions from "../table-actions"
import { Pagination } from "./pagination"
import type { IPaginationProps, TCellProps } from "./types"
import { rowsPerPageOptions } from "./utils"

// type for meta
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> extends TCellProps {
        className?: string
        thClassName?: string
        tdClassName?: string
    }
}

interface DataTableProps<TData, TValue> extends IPaginationProps<TData> {
    columns: (ColumnDef<TData, TValue> & { fixed?: "left" | "right" })[]
    className?: string
    prev?: null | string
    next?: null | string
    rowClassName?: (item: TData) => string
    disableNumeration?: boolean
    onEdit?: (data: Row<TData>) => void
    onDelete?: (data: Row<TData>) => void
    onUndo?: (data: Row<TData>) => void
    onView?: (data: Row<TData>) => void
    additionalActions?: ((data: Row<TData>) => React.ReactNode)[]
    actionMenuMode?: boolean
    actionHeader?: ReactNode
    tableProps?: TableProps
    header?: ReactNode
    enableVirtualization?: boolean
    estimatedRowHeight?: number
}

const EMPTY_ARRAY: [] = []

export function CustomTable<TData, TValue>({
    columns,
    data = EMPTY_ARRAY,
    count,
    className,
    isLoading = false,
    pageKey = SEARCH_PARAMS.PAGE,
    pageSizeKey = SEARCH_PARAMS.PAGE_SIZE,
    rowClassName,
    disableNumeration = false,
    onDelete,
    onEdit,
    onUndo,
    onView,
    additionalActions,
    actionMenuMode,
    actionHeader,
    header,
    paginationClassName,
    disableSetPageSize,
    pageSize,
    enableVirtualization = false,
    estimatedRowHeight = 53,
    tableProps,
}: DataTableProps<TData, TValue>) {
    const isAction =
        onDelete ||
        onView ||
        onEdit ||
        onUndo ||
        additionalActions ||
        actionHeader

    const tableContainerRef = useRef<HTMLDivElement>(null)

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns:
            isAction ?
                [
                    ...columns,
                    {
                        header: () => actionHeader || " ",
                        accessorKey: "action",
                        cell: ({ row }) => (
                            <TableActions
                                menuMode={actionMenuMode}
                                onDelete={
                                    onDelete ? () => onDelete?.(row) : undefined
                                }
                                onEdit={
                                    onEdit ? () => onEdit?.(row) : undefined
                                }
                                onUndo={
                                    onUndo ? () => onUndo?.(row) : undefined
                                }
                                onView={
                                    onView ? () => onView?.(row) : undefined
                                }
                                additionalActions={additionalActions?.map(
                                    (action) => action(row),
                                )}
                            />
                        ),
                        meta: {
                            fixed: "right",
                            thClassName: cn(
                                "text-center w-1",
                                actionHeader && "py-2",
                            ),
                        },
                    },
                ]
            :   columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const { rows } = table.getRowModel()

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimatedRowHeight,
        overscan: 10,
        enabled: enableVirtualization,
    })

    const search = useSearch({ strict: false })
    // @ts-expect-error sdfs
    const page = search[pageKey] || 1
    const pageSizeValue =
        // @ts-expect-error sdfs
        pageSize || search[pageSizeKey] || rowsPerPageOptions[0].id

    const virtualRows =
        enableVirtualization ? rowVirtualizer.getVirtualItems() : null
    const totalSize = enableVirtualization ? rowVirtualizer.getTotalSize() : 0

    const paddingTop =
        virtualRows && virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
    const paddingBottom =
        virtualRows && virtualRows.length > 0 ?
            totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
        :   0

    return (
        <main className={cn("w-full", className)}>
            <div
                ref={tableContainerRef}
                className="rounded-md border overflow-auto relative bg-background"
            >
                {header}

                {isLoading && (
                    <div className="absolute top-0 w-full h-full grid place-items-center bg-background/60 backdrop-blur-[2px] z-20">
                        <LogoLoader size={44} />
                    </div>
                )}

                <Table tableWrapperRef={tableContainerRef} {...tableProps}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="cursor-default"
                            >
                                {!disableNumeration && (
                                    <TableHead
                                        fixed="left"
                                        className="w-5 font-semibold text-muted-foreground"
                                    >
                                        №
                                    </TableHead>
                                )}
                                {headerGroup.headers.map((h) => {
                                    const {
                                        column: {
                                            columnDef: { meta, header },
                                        },
                                        getContext,
                                    } = h

                                    return (
                                        <TableHead
                                            className={cn(
                                                "font-semibold text-muted-foreground",
                                                meta?.className,
                                                meta?.thClassName,
                                            )}
                                            fixed={meta?.fixed}
                                            fixedPosition={meta?.fixedPosition}
                                            key={h.id}
                                        >
                                            {h.isPlaceholder ? null : (
                                                flexRender(header, getContext())
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {enableVirtualization && paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}

                        {rows.length ?
                            enableVirtualization && virtualRows ?
                                virtualRows.map((virtualRow) => {
                                    const row = rows[virtualRow.index]
                                    const i = virtualRow.index
                                    return (
                                        <TableRow
                                            key={virtualRow.key}
                                            className={cn(
                                                "",
                                                rowClassName ?
                                                    rowClassName(row.original)
                                                :   "",
                                            )}
                                            data-state={
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                        >
                                            {!disableNumeration && (
                                                <TableCell
                                                    fixed="left"
                                                    className="w-4 text-center"
                                                >
                                                    {(page - 1) *
                                                        pageSizeValue +
                                                        i +
                                                        1}
                                                </TableCell>
                                            )}
                                            {row.getVisibleCells().map((c) => {
                                                const {
                                                    column: {
                                                        columnDef: {
                                                            meta,
                                                            cell,
                                                        },
                                                    },
                                                    getContext,
                                                } = c
                                                return (
                                                    <TableCell
                                                        key={c.id}
                                                        className={cn(
                                                            "",
                                                            meta?.className,
                                                            meta?.tdClassName,
                                                        )}
                                                        fixed={meta?.fixed}
                                                        fixedPosition={
                                                            meta?.fixedPosition
                                                        }
                                                    >
                                                        {flexRender(
                                                            cell,
                                                            getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })
                            :   rows.map((row, i) => (
                                    <TableRow
                                        className={cn(
                                            rowClassName ?
                                                rowClassName(row.original)
                                            :   "",
                                        )}
                                        // @ts-expect-error sdf
                                        key={row.original?.id || i}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                    >
                                        {!disableNumeration && (
                                            <TableCell
                                                fixed="left"
                                                className="w-4 text-center"
                                            >
                                                {(page - 1) * pageSizeValue +
                                                    i +
                                                    1}
                                            </TableCell>
                                        )}
                                        {row.getVisibleCells().map((c) => {
                                            const {
                                                column: {
                                                    columnDef: { meta, cell },
                                                },
                                                getContext,
                                            } = c
                                            return (
                                                <TableCell
                                                    key={c.id}
                                                    className={cn(
                                                        "",
                                                        meta?.className,
                                                        meta?.tdClassName,
                                                    )}
                                                    fixed={meta?.fixed}
                                                    fixedPosition={
                                                        meta?.fixedPosition
                                                    }
                                                >
                                                    {flexRender(
                                                        cell,
                                                        getContext(),
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))

                        :   <TableRow>
                                {!disableNumeration && <TableCell />}
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Empty
                                </TableCell>
                                {!!actionHeader && <TableCell />}
                            </TableRow>
                        }

                        {enableVirtualization && paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>

            {!!count && (
                <Pagination
                    paginationClassName={cn(paginationClassName)}
                    count={count}
                    pageKey={pageKey}
                    pageSizeKey={pageSizeKey}
                    data={data}
                    isLoading={isLoading}
                    disableSetPageSize={disableSetPageSize}
                />
            )}
        </main>
    )
}
