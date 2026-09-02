import i18n from "@/lib/i18n/request"
import { cn } from "@/lib/utils/shadcn"

type Origin = "advance" | "bonus" | "penalty" | null | undefined

const STYLE: Record<"advance" | "bonus" | "penalty", string> = {
    advance:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    bonus: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    penalty: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
}

/** Small pill shown on a finance row that was auto-booked from a salary payout. */
export default function OriginBadge({ origin }: { origin: Origin }) {
    if (!origin) return <span className="text-sm text-muted-foreground">—</span>
    return (
        <span
            className={cn(
                "inline-block rounded px-2 py-0.5 text-xs font-medium",
                STYLE[origin],
            )}
        >
            {i18n.t(`salary.${origin}`)}
        </span>
    )
}
