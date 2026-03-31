import {
    BoxIcon,
    CheckSquareIcon,
    ChevronRight,
    ClipboardListIcon,
    FactoryIcon,
    LayoutDashboardIcon,
    PanelLeftOpenIcon,
    PanelRightOpenIcon,
    SettingsIcon,
    ShoppingCartIcon,
    UserIcon,
    WalletIcon,
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
    const { isAdmin } = useProfileQuery()
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
                    enabled: isAdmin,
                    title: "Admins",
                }),
                linkOptions({
                    to: "/clients",
                    enabled: isAdmin,
                    title: "Clients",
                }),
                linkOptions({
                    to: "/suppliers",
                    enabled: isAdmin,
                    title: "Suppliers",
                }),
            ],
        }),
        linkOptions({
            to: "/extra",
            icon: <BoxIcon />,
            enabled: true,
            title: "Warehouse",
            childs: [
                linkOptions({
                    to: "/ready-products",
                    enabled: isAdmin,
                    title: "Ready Product",
                }),
                linkOptions({
                    to: "/raw-materials",
                    enabled: isAdmin,
                    title: "Raw Materials",
                }),
            ],
        }),
        linkOptions({
            to: "/raw-material-requests",
            icon: <ClipboardListIcon />,
            enabled: true,
            title: "Office Manager",
            childs: [
                linkOptions({
                    to: "/raw-material-requests",
                    enabled: isAdmin,
                    title: "Raw Material Requests",
                }),
            ],
        }),
        linkOptions({
            to: "/orders",
            icon: <ShoppingCartIcon />,
            enabled: true,
            title: "Orders",
            childs: [
                linkOptions({
                    to: "/orders",
                    enabled: isAdmin,
                    title: "Sales",
                }),
            ],
        }),
        linkOptions({
            to: "/task-manager",
            icon: <CheckSquareIcon />,
            enabled: true,
            title: "Task Manager",
            childs: [
                linkOptions({
                    to: "/task-manager",
                    enabled: isAdmin,
                    title: "Task Manager",
                }),
            ],
        }),
        linkOptions({
            to: "/finance",
            icon: <WalletIcon />,
            enabled: true,
            title: "Finance",
            childs: [
                linkOptions({
                    to: "/finance/dashboard",
                    enabled: isAdmin,
                    title: "Dashboard",
                }),
                linkOptions({
                    to: "/finance/expence",
                    enabled: isAdmin,
                    title: "Expense",
                }),
                linkOptions({
                    to: "/finance/income",
                    enabled: isAdmin,
                    title: "Income",
                }),
            ],
        }),
        linkOptions({
            to: "/manufactures",
            icon: <FactoryIcon />,
            enabled: true,
            title: "Manufactures",
            childs: [
                linkOptions({
                    to: "/manufactures",
                    enabled: isAdmin,
                    title: "Manufactures",
                }),
            ],
        }),
        linkOptions({
            to: "/settings",
            icon: <SettingsIcon />,
            enabled: true,
            title: "Settings",
            childs: [
                linkOptions({
                    to: "/settings/products",
                    enabled: isAdmin,
                    title: "Products",
                }),
                linkOptions({
                    to: "/settings/raw-materials",
                    enabled: isAdmin,
                    title: "Raw Materials",
                }),
                linkOptions({
                    to: "/settings/currency",
                    enabled: isAdmin,
                    title: "Currency",
                }),
                linkOptions({
                    to: "/settings/payment-type",
                    enabled: isAdmin,
                    title: "Payment Types",
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
                                <Img
                                    src="/images/logo.svg"
                                    className="w-[150px]"
                                />
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
                            :   <Collapsible
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
