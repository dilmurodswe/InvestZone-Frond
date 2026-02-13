import { Link, useLocation } from "@tanstack/react-router"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"

type PageTab = {
    to: string
    label: string
    enabled: boolean
}

type Props = {
    tabs: PageTab[]
}

export default function PageTabs({ tabs }: Props) {
    const pathname = useLocation({
        select: (l) => l.pathname,
    })

    return (
        <Tabs value={tabs.find((el) => pathname.includes(el.to))?.to}>
            <div className="w-fit overflow-x-auto">
                <TabsList>
                    {tabs.map(
                        ({ enabled, ...t }) =>
                            enabled && (
                                <Link key={t.to} {...t}>
                                    <TabsTrigger value={t.to}>
                                        {t.label}
                                    </TabsTrigger>
                                </Link>
                            ),
                    )}
                </TabsList>
            </div>
        </Tabs>
    )
}
