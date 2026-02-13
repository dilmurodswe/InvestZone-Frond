import {
    ChevronRight,
    LayoutDashboardIcon,
    PanelLeftOpenIcon,
    PanelRightOpenIcon,
    UserIcon,
    UserStarIcon,
} from "lucide-react"

import Img from "@/components/custom/img"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { useProfileQuery } from "@/hooks/react-query/use-profile-query"
import { Link, linkOptions, useLocation } from "@tanstack/react-router"

export function NavMain() {
    const { isAdmin, isManager } = useProfileQuery()
    const { setOpenMobile, open } = useSidebar()
    const pathname = useLocation({ select: (l) => l.pathname })

    const navigationLinks = [
        linkOptions({
            to: "/dashboard",
            icon: <LayoutDashboardIcon />,
            enabled: isAdmin,
            title: "Dashboard",
            childs: [],
        }),
        linkOptions({
            to: "/admins",
            icon: <UserIcon />,
            enabled: true,
            title: "Users",
            childs: [
                linkOptions({
                    to: "/admins",
                    icon: <UserStarIcon />,
                    enabled: isAdmin,
                    title: "Admins",
                }),
                linkOptions({
                    to: "/clients",
                    icon: <UserIcon />,
                    enabled: isAdmin || isManager,
                    title: "Clients",
                }),
            ],
        }),
    ]

    return (
        <SidebarGroup>
            <SidebarMenu>
                <div className="flex justify-between items-center gap-4 mb-4 mt-1">
                    {!open && (
                        <SidebarTrigger className="size-8" variant="ghost">
                            <PanelLeftOpenIcon size={20} />
                        </SidebarTrigger>
                    )}
                    {open && (
                        <>
                            <Link
                                to="/dashboard"
                                className="rounded-lg"
                                onClick={() => {
                                    setOpenMobile(false)
                                }}
                            >
                                <Img src="/images/logo.svg" className="w-[150px]" />
                            </Link>
                            <SidebarTrigger className="size-8" variant="ghost">
                                <PanelRightOpenIcon size={20} />
                            </SidebarTrigger>
                        </>
                    )}
                </div>
                {navigationLinks.map(
                    ({ enabled, title, childs, icon, ...item }) => {
                        return (
                            enabled &&
                            (!childs.length ?
                                <Link
                                    key={item.to}
                                    {...item}
                                    activeProps={{
                                        className:
                                            "[&_button]:bg-primary hover:[&_button]:bg-primary hover:[&_button]:text-primary-foreground [&_button]:text-primary-foreground",
                                    }}
                                    className="rounded-lg text-foreground"
                                    onClick={() => {
                                        setOpenMobile(false)
                                    }}
                                >
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip={title}>
                                            {icon}
                                            <span>{title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </Link>
                                : <Collapsible
                                    key={title}
                                    asChild
                                    defaultOpen={pathname.startsWith(item.to)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={title}>
                                                {icon}
                                                <span>{title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {childs.map(
                                                    (subItem) =>
                                                        subItem.enabled && (
                                                            <SidebarMenuSubItem
                                                                key={
                                                                    subItem.title
                                                                }
                                                            >
                                                                <Link
                                                                    key={
                                                                        subItem.to
                                                                    }
                                                                    to={
                                                                        subItem.to
                                                                    }
                                                                    activeProps={{
                                                                        className:
                                                                            "[&_span_svg]:text-primary-foreground [&_span]:bg-primary hover:[&_span]:bg-primary hover:[&_span]:text-primary-foreground [&_span]:text-primary-foreground",
                                                                    }}
                                                                    className="rounded-lg text-foreground"
                                                                    onClick={() => {
                                                                        setOpenMobile(
                                                                            false,
                                                                        )
                                                                    }}
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                    >
                                                                        <span className="flex items-center gap-1">
                                                                            {
                                                                                subItem.icon
                                                                            }
                                                                            {
                                                                                subItem.title
                                                                            }
                                                                        </span>
                                                                    </SidebarMenuSubButton>
                                                                </Link>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>)
                        )
                    },
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}
