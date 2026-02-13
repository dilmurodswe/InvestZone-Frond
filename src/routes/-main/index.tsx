import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Menu } from "lucide-react"
import type { PropsWithChildren } from "react"
import { AppSidebar } from "./components/sidebar"

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AppSidebar className="shadow" />
            <SidebarInset className="bg-primary-foreground overflow-auto">
                <SidebarTrigger
                    variant={"default"}
                    className="md:hidden fixed bottom-5 right-5 rounded-full w-10 h-9 z-50"
                >
                    <Menu className="text-white" />
                </SidebarTrigger>

                <div className="relative min-h-svh max-h-svh overflow-y-auto bg-[#f3f4f6] flex flex-col">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
