import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"

type StatItem = { date: string; total: number }
type PaymentTypeStats = Record<
    string,
    { total: number; items: { name: string; value: number }[] }
>

export const useDashboardQuery = (params: {
    start_date?: string
    end_date?: string
}) => {
    const expenseStats = useGet<StatItem[]>(API.DASHBOARD.EXPENSE_STATS, {
        params,
    })
    const incomeStats = useGet<StatItem[]>(API.DASHBOARD.INCOME_STATS, {
        params,
    })
    const paymentTypeStats = useGet<PaymentTypeStats>(
        API.DASHBOARD.PAYMENT_TYPE_STATS,
        { params },
    )

    return { expenseStats, incomeStats, paymentTypeStats }
}
