"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils/shadcn"
import { Link } from "@tanstack/react-router"
import { CardTitle } from "../ui/card"
import type { HeaderCrumbLink } from "./types"

type Props = {
    links: HeaderCrumbLink[]
}

export function HeaderCrumb({ links }: Props) {
    return (
        <Breadcrumb>
            <BreadcrumbList className="min-h-9">
                {links.length > 1 &&
                    links.slice(0, -1).map((item, index) => (
                        // eslint-disable-next-line react-x/no-array-index-key
                        <BreadcrumbItem key={index}>
                            <BreadcrumbLink
                                asChild
                                className="max-w-20 truncate"
                            >
                                <Link {...item}>{item.label ?? ""}</Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                        </BreadcrumbItem>
                    ))}

                {links.length > 1 && (
                    <BreadcrumbItem>
                        <BreadcrumbPage
                            className={cn(
                                "max-w-20 truncate md:max-w-none font-medium",
                            )}
                        >
                            {links.at(-1)?.label ?? ""}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                )}
                {links.length === 1 && (
                    <CardTitle className="text-foreground text-xl md:text-2xl">
                        {links.at(-1)?.label ?? ""}
                    </CardTitle>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
