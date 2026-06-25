import {
    BoxIcon,
    CheckSquareIcon,
    ChevronRight,
    ClipboardListIcon,
    FactoryIcon,
    // LayoutDashboardIcon,
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
import { useTranslation } from "react-i18next"

export function NavMain() {
    const { t } = useTranslation()
    const { isAdmin } = useProfileQuery()
    const { setOpenMobile, open } = useSidebar()
    const pathname = useLocation({ select: (l) => l.pathname })

    const navigationLinks = [
        // linkOptions({
        //     to: "/dashboard",
        //     icon: <LayoutDashboardIcon />,
        //     enabled: isAdmin,
        //     title: "Dashboard",
        //     childs: [],
        // }),
        linkOptions({
            to: "/finance",
            icon: <WalletIcon />,
            enabled: true,
            title: t("nav.finance"),
            childs: [
                linkOptions({
                    to: "/finance/dashboard",
                    enabled: isAdmin,
                    title: t("nav.dashboard"),
                }),
                linkOptions({
                    to: "/finance/expence",
                    enabled: isAdmin,
                    title: t("nav.expense"),
                }),
                linkOptions({
                    to: "/finance/income",
                    enabled: isAdmin,
                    title: t("nav.income"),
                }),
            ],
        }),
        linkOptions({
            to: "/admins",
            icon: <UserIcon />,
            enabled: true,
            title: t("nav.users"),
            childs: [
                linkOptions({
                    to: "/admins",
                    enabled: isAdmin,
                    title: t("nav.admins"),
                }),
                linkOptions({
                    to: "/clients",
                    enabled: isAdmin,
                    title: t("nav.clients"),
                }),
                linkOptions({
                    to: "/suppliers",
                    enabled: isAdmin,
                    title: t("nav.suppliers"),
                }),
            ],
        }),
        linkOptions({
            to: "/extra",
            icon: <BoxIcon />,
            enabled: true,
            title: t("nav.warehouse"),
            childs: [
                linkOptions({
                    to: "/ready-products",
                    enabled: isAdmin,
                    title: t("nav.readyProduct"),
                }),
                linkOptions({
                    to: "/raw-materials",
                    enabled: isAdmin,
                    title: t("nav.rawMaterials"),
                }),
            ],
        }),
        linkOptions({
            to: "/raw-material-requests",
            icon: <ClipboardListIcon />,
            enabled: true,
            title: t("nav.officeManager"),
            childs: [
                linkOptions({
                    to: "/raw-material-requests",
                    enabled: isAdmin,
                    title: t("nav.rawMaterialRequests"),
                }),
            ],
        }),
        linkOptions({
            to: "/orders",
            icon: <ShoppingCartIcon />,
            enabled: true,
            title: t("nav.orders"),
            childs: [
                linkOptions({
                    to: "/orders",
                    enabled: isAdmin,
                    title: t("nav.sales"),
                }),
            ],
        }),
        linkOptions({
            to: "/task-manager",
            icon: <CheckSquareIcon />,
            enabled: true,
            title: t("nav.taskManager"),
            childs: [
                linkOptions({
                    to: "/task-manager",
                    enabled: isAdmin,
                    title: t("nav.taskManager"),
                }),
            ],
        }),

        linkOptions({
            to: "/manufactures",
            icon: <FactoryIcon />,
            enabled: true,
            title: t("nav.manufactures"),
            childs: [
                linkOptions({
                    to: "/manufactures",
                    enabled: isAdmin,
                    title: t("nav.reskaShtrips"),
                }),
                linkOptions({
                    to: "/ready-strips",
                    enabled: isAdmin,
                    title: t("nav.readyShtrips"),
                }),
                linkOptions({
                    to: "/rolling-plans",
                    enabled: isAdmin,
                    title: t("nav.prokatka"),
                }),
            ],
        }),
        linkOptions({
            to: "/settings",
            icon: <SettingsIcon />,
            enabled: true,
            title: t("nav.settings"),
            childs: [
                linkOptions({
                    to: "/settings/products",
                    enabled: isAdmin,
                    title: t("nav.products"),
                }),
                linkOptions({
                    to: "/settings/raw-materials",
                    enabled: isAdmin,
                    title: t("nav.rawMaterials"),
                }),
                linkOptions({
                    to: "/settings/currency",
                    enabled: isAdmin,
                    title: t("nav.currency"),
                }),
                linkOptions({
                    to: "/settings/payment-type",
                    enabled: isAdmin,
                    title: t("nav.paymentTypes"),
                }),
                linkOptions({
                    to: "/settings/machine",
                    enabled: isAdmin,
                    title: t("nav.machine"),
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
