import BaseSelect from "@/components/ui/base-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SEARCH_PARAMS } from "@/lib/constants/search-params"
import { cn } from "@/lib/utils/shadcn"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { useCallback, useDeferredValue, useEffect, useRef } from "react"
import type { IPaginationProps } from "./types"
import { rowsPerPageOptions } from "./utils"

interface IPagination {
    page?: number
    size?: number
}

// utils.ts da shu optionlar bo'lishi kerak (agar yo'q bo'lsa qo'shing):
// export const rowsPerPageOptions = [
//     { id: 10, label: "10" },
//     { id: 20, label: "20" },
//     { id: 50, label: "50" },
//     { id: 100, label: "100" },
// ]

export function Pagination<TData>({
    paginationClassName,
    count,
    pageKey = SEARCH_PARAMS.PAGE,
    pageSizeKey = SEARCH_PARAMS.PAGE_SIZE,
    data,
    isLoading,
    disableSetPageSize = true,
    pageSize,
}: IPaginationProps<TData>) {
    const navigate = useNavigate()
    const search = useSearch({ strict: false })
    // @ts-expect-error sdf
    const page = search[pageKey] || 1
    const pageSizeValue =
        // @ts-expect-error sfs
        pageSize || search[pageSizeKey] || rowsPerPageOptions[0].id
    const pageCount = count ? Math.ceil(count / pageSizeValue) : 0

    const jumpInputRef = useRef<HTMLInputElement>(null)
    const deferredPage = useDeferredValue(page)

    const setPagination = useCallback(
        ({ page, size }: IPagination) => {
            requestAnimationFrame(() => {
                navigate({
                    // @ts-expect-error sfsd
                    search: {
                        ...search,
                        [pageKey]: page,
                        [pageSizeKey]:
                            size === undefined ? pageSizeValue : size,
                    },
                    replace: true,
                })
            })
        },
        [navigate, search, pageKey, pageSizeKey, pageSizeValue],
    )

    const handleJump = useCallback(() => {
        const jumpVal = jumpInputRef.current?.value
        const pageNum = parseInt(jumpVal || "0", 10)

        if (pageNum > 0 && pageNum <= (pageCount || 0)) {
            setPagination({ page: pageNum })
        }
    }, [pageCount, setPagination])

    const handleJumpOnKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            const jumpVal = jumpInputRef.current?.value
            const pageNum = parseInt(jumpVal || "0", 10)
            if (
                pageNum > 0 &&
                pageNum <= (pageCount || 0) &&
                e.key === "Enter"
            ) {
                setPagination({ page: pageNum })
            }
        },
        [pageCount, setPagination],
    )

    useEffect(() => {
        if (!!data && !data.length && deferredPage > 1 && !isLoading) {
            setPagination({
                page: deferredPage - 1,
            })
        }
    }, [data, deferredPage, isLoading, setPagination])

    return (
        <footer
            id="pagination"
            className={cn(
                "flex items-center justify-between px-2 w-full mt-5",
                paginationClassName,
            )}
        >
            <main
                className={cn(
                    "flex items-center md:justify-between gap-y-3 gap-x-8 w-full flex-wrap sm:flex-nowrap",
                )}
            >
                {/* Eski alohida size selector — saqlab qolindi (disableSetPageSize=false bo'lsa ishlaydi) */}
                {(count || 0) > rowsPerPageOptions[0].id &&
                    !disableSetPageSize && (
                        <BaseSelect
                            options={rowsPerPageOptions}
                            value={rowsPerPageOptions.find(
                                (o) => o.id === pageSizeValue,
                            )}
                            onChange={(opt) => {
                                setPagination({
                                    page: undefined,
                                    size: opt?.id,
                                })
                            }}
                            className="min-w-16"
                            placeholder=""
                            isClearable={false}
                        />
                    )}

                {!!pageCount && pageCount > 1 && (
                    <main className="flex items-center gap-4">
                        <p className="font-medium whitespace-nowrap">
                            {deferredPage} / {pageCount}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size={"icon"}
                                onClick={() => {
                                    setPagination({ page: undefined })
                                }}
                                disabled={deferredPage < 2}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <ChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                size={"icon"}
                                onClick={() => {
                                    setPagination({
                                        page: deferredPage - 1,
                                    })
                                }}
                                disabled={deferredPage < 2}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                size={"icon"}
                                onClick={() => {
                                    setPagination({
                                        page: deferredPage + 1,
                                    })
                                }}
                                disabled={deferredPage >= pageCount}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                size={"icon"}
                                onClick={() => {
                                    setPagination({
                                        page: pageCount,
                                    })
                                }}
                                disabled={deferredPage >= pageCount}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight />
                            </Button>
                        </div>
                    </main>
                )}

                {/* Page size selector — har doim ko'rinadi */}
                {!!count && (
                    <aside className="flex items-center gap-4 ml-auto">
                        <BaseSelect
                            options={rowsPerPageOptions}
                            value={rowsPerPageOptions.find(
                                (o) => o.id === pageSizeValue,
                            )}
                            onChange={(opt) => {
                                setPagination({
                                    page: 1, // size o'zgarganda 1-sahifaga qayt
                                    size: opt?.id,
                                })
                            }}
                            className="min-w-20"
                            placeholder=""
                            isClearable={false}
                        />

                        {/* Jump to page */}
                        {!!pageCount && pageCount > 1 && (
                            <>
                                <Input
                                    onKeyDown={handleJumpOnKeyDown}
                                    ref={jumpInputRef}
                                    type="number"
                                    className="w-14 hidden"
                                    min={1}
                                    max={pageCount}
                                />
                                <Button className="hidden" onClick={handleJump}>
                                    to page
                                </Button>
                            </>
                        )}
                    </aside>
                )}
            </main>
        </footer>
    )
}
