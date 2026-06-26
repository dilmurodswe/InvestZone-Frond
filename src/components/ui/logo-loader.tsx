import { cn } from "@/lib/utils/shadcn"

interface LogoLoaderProps {
    /** Diameter of the spinner ring in px */
    size?: number
    /** Cover the whole screen with a blurred backdrop */
    fullscreen?: boolean
    /** Optional text shown under the logo */
    label?: string
    className?: string
}

/**
 * Pretty branded loader: the app logo mark sits in the middle of a
 * smoothly spinning ring in the primary color. Used everywhere data is
 * loading (tables, sections, full screen, global network indicator).
 */
const LogoLoader = ({
    size = 48,
    fullscreen = false,
    label,
    className,
}: LogoLoaderProps) => {
    const markSize = Math.round(size * 0.52)

    const content = (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                className,
            )}
        >
            <div
                className="relative inline-flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                {/* Spinning ring */}
                <span
                    className="absolute inset-0 rounded-full border-[3px] border-primary/15 border-t-primary animate-[spin_0.8s_linear_infinite]"
                    aria-hidden
                />
                {/* Soft glow */}
                <span
                    className="absolute inset-1 rounded-full bg-primary/5 animate-pulse"
                    aria-hidden
                />
                {/* Logo mark */}
                <img
                    src="/images/favicon.png"
                    alt=""
                    draggable={false}
                    className="animate-pulse select-none"
                    style={{ width: markSize, height: markSize }}
                />
            </div>
            {label && (
                <span className="text-xs font-medium text-muted-foreground animate-pulse">
                    {label}
                </span>
            )}
        </div>
    )

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm">
                {content}
            </div>
        )
    }

    return content
}

export default LogoLoader
