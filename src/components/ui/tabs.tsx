"use client"

import { cn } from "@/lib/utils/shadcn"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"

function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    )
}

function TabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                // <sm: gorizontal scroll + nowrap
                "flex w-full flex-nowrap gap-2 overflow-x-auto whitespace-nowrap scroll-smooth snap-x snap-mandatory",
                // mobil touch scroll
                "[touch-action:pan-x] [-webkit-overflow-scrolling:touch]",
                // mobil: edge-to-edge (ixtiyoriy), sm+: normal
                "px-4 sm:mx-0 sm:px-0",
                // scrollbarni yashirish
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                // ≥sm: scroll yo‘q, wrap yoqiladi, snapping o‘chadi
                "sm:overflow-x-visible sm:whitespace-normal sm:snap-none",
                // joylashuv
                "sm:justify-center",
                className,
            )}
            {...props}
        />
    )
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "bg-white py-2 px-3 font-medium rounded cursor-pointer",
                "flex-none shrink-0 min-w-fit snap-start",
                "sm:flex-initial sm:shrink sm:min-w-0",
                "text-gray-500 whitespace-nowrap",
                "data-[state=active]:bg-primary data-[state=active]:text-white",
                "inline-flex items-center justify-center gap-1.5 transition",
                "disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
            {...props}
        />
    )
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn("flex-1 outline-none", className)}
            {...props}
        />
    )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
