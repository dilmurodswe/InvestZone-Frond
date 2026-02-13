import MessageModal from "@/components/custom/message-modal"
import { LanguageProvider } from "@/providers/language-provider"
import { ModalProvider } from "@/providers/modal-provider"
import { createRootRoute, Outlet } from "@tanstack/react-router"
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

const RootLayout = () => (
    <>
        <LanguageProvider>
            <ModalProvider>
                <Outlet />
                {/* <TanStackRouterDevtools position="bottom-right" /> */}
                <MessageModal />
            </ModalProvider>
        </LanguageProvider>
    </>
)

export const Route = createRootRoute({ component: RootLayout })
