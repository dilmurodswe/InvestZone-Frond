import { cn } from "@/lib/utils/shadcn"
import type { ReactNode } from "react"
import FilterInput from "../filter/filter-input"
import { HeaderCrumb } from "./header-crumb"
import type { HeaderCrumbLink } from "./types"

type Props = {
    links?: HeaderCrumbLink[]
    isSearch?: boolean
    wrapperClassName?: string
    className?: string
    rightClassName?: string
    bottom?: ReactNode
    rightLeftChild?: ReactNode
    rightRightChild?: ReactNode
}

export default function Navbar({
    links,
    isSearch = false,
    wrapperClassName,
    className,
    rightClassName,
    bottom,
    rightLeftChild,
    rightRightChild,
}: Props) {
    return (
        <nav
            id="main-header"
            className={cn(
                "bg-background shadow-sm p-3 sticky top-0 left-0 flex flex-col gap-2 z-40",
                wrapperClassName,
            )}
        >
            <main
                className={cn(
                    "flex justify-between flex-wrap md:flex-nowrap gap-x-8 gap-y-2 items-center md:items-start",
                    className,
                )}
            >
                {links?.length ?
                    <HeaderCrumb links={links} />
                :   null}
                <div
                    className={cn(
                        "flex-auto flex justify-end flex-wrap gap-3",
                        rightClassName,
                    )}
                >
                    {/* <SelectLanguage /> */}
                    {rightLeftChild}
                    {isSearch && <FilterInput />}
                    {isSearch}
                    {rightRightChild}
                </div>
            </main>
            {bottom}
        </nav>
    )
}
