import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"

type StatItem = { date: string; total: number }
type PaymentTypeStats = Record<
    string,
    { total: number; items: { name: string; value: number }[] }
>

// The global query config only refetches on mount when there is no cached data,
// so re-opening the dashboard showed stale numbers until a manual refresh.
// Force a fresh pull every time the page mounts.
const freshOnMount = { staleTime: 0, refetchOnMount: "always" } as const

export const useDashboardQuery = (params: {
    start_date?: string
    end_date?: string
}) => {
    const expenseStats = useGet<StatItem[]>(API.DASHBOARD.EXPENSE_STATS, {
        params,
        options: freshOnMount,
    })
    const incomeStats = useGet<StatItem[]>(API.DASHBOARD.INCOME_STATS, {
        params,
        options: freshOnMount,
    })
    const paymentTypeStats = useGet<PaymentTypeStats>(
        API.DASHBOARD.PAYMENT_TYPE_STATS,
        { params, options: freshOnMount },
    )

    return { expenseStats, incomeStats, paymentTypeStats }
}
