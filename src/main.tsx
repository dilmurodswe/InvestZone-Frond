import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Suspense } from "react"
import { createRoot } from "react-dom/client"
import { I18nextProvider } from "react-i18next"
import Loader from "./components/ui/loader"
import { Toaster } from "./components/ui/sonner"
import { TooltipProvider } from "./components/ui/tooltip"
import "./index.css"
import { setupAxiosInterceptors } from "./lib/api/axios-instance"
import i18n from "./lib/i18n/request"
import { ConfirmProvider } from "./providers/confirm-provider"
import { LanguageProvider } from "./providers/language-provider"
import { routeTree } from "./routeTree.gen"

// Setup axios interceptors with queryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: (query) => query.state.data === undefined,
            // retry: import.meta.env.MODE === "development" ? 0 : 3,
            retry: false,
            gcTime: 1000 * 60 * 2,
            staleTime: 60 * 1000,
        },
    },
})
setupAxiosInterceptors(queryClient)

const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
        // <StrictMode>
        <I18nextProvider i18n={i18n}>
            <LanguageProvider>
                <Suspense fallback={<Loader />}>
                    <ConfirmProvider>
                        <TooltipProvider>
                            <QueryClientProvider client={queryClient}>
                                <RouterProvider router={router} />
                                <Toaster />
                            </QueryClientProvider>
                        </TooltipProvider>
                    </ConfirmProvider>
                </Suspense>
            </LanguageProvider>
        </I18nextProvider>,
        // </StrictMode>,
    )
}
