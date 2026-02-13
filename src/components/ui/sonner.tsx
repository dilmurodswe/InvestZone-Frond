"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    success: "!text-background !bg-foreground/80",
                    error: "!text-destructive",
                    warning: "!text-warning",
                    info: "!text-info",
                    closeButton: "-right-3! left-[unset]! hover:bg-background!",
                },
                closeButton: true,
            }}
            position="bottom-center"
            {...props}
        />
    )
}

export { Toaster }
