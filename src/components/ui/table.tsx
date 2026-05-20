"use client"

import { cn } from "@/lib/utils/shadcn"
import * as React from "react"
import type { TCellProps } from "../custom/custom-table/types"

export interface TableProps extends React.ComponentProps<"table"> {
    maxHeight?: string | number
    tableWrapperClassName?: string
    tableContainerClassName?: string
    tableWrapperRef?: React.RefObject<HTMLDivElement | null>
}

function Table({
    className,
    maxHeight,
    tableWrapperClassName,
    tableContainerClassName,
    tableWrapperRef,
    ...props
}: TableProps) {
    const [navbarHeight, setNavbarHeight] = React.useState(0)
    const [paginationHeight, setPaginationHeight] = React.useState(0)

    React.useEffect(() => {
        const updateHeights = () => {
            const navbar = document.getElementById("main-navbar")
            const pagination = document.getElementById("pagination")

            if (navbar) {
                setNavbarHeight(navbar.offsetHeight)
            }
            if (pagination) {
                setPaginationHeight(pagination.offsetHeight)
            }
        }

        updateHeights()
        window.addEventListener("resize", updateHeights)
        return () => window.removeEventListener("resize", updateHeights)
    }, [])

    return (
        <div
            data-slot="table-container"
            className={cn(
                "relative w-full overflow-auto",
                tableContainerClassName,
            )}
        >
            <div
                ref={tableWrapperRef}
                className={cn(
                    "overflow-x-auto scrollbar",
                    tableWrapperClassName,
                )}
                style={{
                    maxHeight:
                        maxHeight ||
                        `calc(100svh - ${navbarHeight}px - ${paginationHeight}px - 14rem)`,
                }}
            >
                <table
                    data-slot="table"
                    className={cn(
                        "w-full caption-bottom text-sm relative",
                        className,
                    )}
                    {...props}
                />
            </div>
        </div>
    )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-navbar"
            className={cn(
                "[&_tr]:border-b bg-secondary sticky top-0 z-10",
                className,
            )}
            {...props}
        />
    )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:last-child]:border-0", className)}
            {...props}
        />
    )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
                className,
            )}
            {...props}
        />
    )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
                "cursor-pointer",
                className,
            )}
            {...props}
        />
    )
}

function TableHead({
    className,
    fixed,
    fixedPosition = 0,
    style,
    ...props
}: React.ComponentProps<"th"> & TCellProps) {
    const fixedStyles =
        fixed ?
            ({
                position: "sticky",
                [fixed]: `${fixedPosition}px`,
                zIndex: fixed === "left" ? 3 : 2,
                ...(style || {}),
            } as React.CSSProperties)
        :   style
    return (
        <th
            data-slot="table-head"
            className={cn(
                "text-foreground h-10 px-2 text-left align-middle font-light whitespace-nowrap [&:has([role=checkbox])]:pr-2 *:[[role=checkbox]]:translate-y-0.5",
                fixed && "shadow-inner drop-shadow bg-muted!",
                className,
            )}
            style={fixedStyles}
            {...props}
        />
    )
}

function TableCell({
    className,
    fixed,
    fixedPosition = 0,
    style,
    ...props
}: React.ComponentProps<"td"> & TCellProps) {
    const fixedStyles =
        fixed ?
            ({
                position: "sticky",
                [fixed]: `${fixedPosition}px`,
                zIndex: 1,
                ...(style || {}),
            } as React.CSSProperties)
        :   style
    return (
        <td
            data-slot="table-cell"
            className={cn(
                "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
                fixed && "shadow-inner drop-shadow bg-card",
                className,
            )}
            style={fixedStyles}
            {...props}
        />
    )
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-muted-foreground mt-4 text-sm", className)}
            {...props}
        />
    )
}

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
}
