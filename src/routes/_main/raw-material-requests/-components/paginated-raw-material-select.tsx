import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { RawMaterial } from "../../settings/raw-materials/-types"

interface PaginatedRawMaterialSelectProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

export default function PaginatedRawMaterialSelect({
    value,
    onChange,
    className,
}: PaginatedRawMaterialSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch raw materials with pagination
    const { data, isLoading } = useGet<PaginatedResponse<RawMaterial>>(
        API.EXTRA.RAW_MATERIALS.INDEX,
        {
            params: {
                page: currentPage,
                page_size: 10,
            },
            deps: [currentPage],
        },
    )

    const rawMaterialOptions = getArray<RawMaterial>(data?.results)
    const totalCount = data?.count || 0
    const totalPages = Math.ceil(totalCount / 10)

    // Find selected item
    const selectedItem = rawMaterialOptions.find(
        (rm) => rm.id.toString() === value,
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleSelect = (id: number) => {
        onChange(id.toString())
        setIsOpen(false)
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Select Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded px-3 py-2 text-sm bg-background text-left flex items-center justify-between ${className}`}
            >
                <span className={selectedItem ? "" : "text-muted-foreground"}>
                    {selectedItem ? selectedItem.name : "Select"}
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded shadow-lg">
                    {/* Options List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ?
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                Loading...
                            </div>
                        : rawMaterialOptions.length === 0 ?
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No items found
                            </div>
                        :   rawMaterialOptions.map((rm) => (
                                <button
                                    key={rm.id}
                                    type="button"
                                    onClick={() => handleSelect(rm.id)}
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                                        value === rm.id.toString() ?
                                            "bg-muted font-medium"
                                        :   ""
                                    }`}
                                >
                                    {rm.name}
                                </button>
                            ))
                        }
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="border-t px-3 py-2 flex items-center justify-between bg-muted/30">
                            <button
                                type="button"
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="text-xs font-medium">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
