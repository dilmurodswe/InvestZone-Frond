import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PayrollEmployee, PayrollRow, SalaryTransaction } from "../-types"

const asArray = <T>(data: unknown): T[] =>
    getArray<T>(
        Array.isArray(data) ? data : (data as { results?: T[] })?.results,
    )

/** Users who get a salary — the picker on the Выдача dialog. */
export const usePayrollEmployeesQuery = () => {
    const res = useGet<PayrollEmployee[]>(API.FINANCE.PAYROLL_EMPLOYEES.INDEX)
    return { ...res, employeeList: asArray<PayrollEmployee>(res.data) }
}

/** The monthly payroll sheet (Зарплата тарқатиш). `month` is "YYYY-MM". */
export const usePayrollQuery = (month: string) => {
    const res = useGet<PayrollRow[] | { results: PayrollRow[] }>(
        API.FINANCE.PAYROLL.INDEX,
        {
            params: { month },
            options: { staleTime: 0, refetchOnMount: "always" },
        },
    )
    return { ...res, payrollList: asArray<PayrollRow>(res.data) }
}

/** Salary transactions for one employee in one month. */
export const useSalaryTransactionsQuery = (
    employee: number | null,
    month: string,
) => {
    const res = useGet<SalaryTransaction[] | { results: SalaryTransaction[] }>(
        API.FINANCE.SALARY_TRANSACTIONS.INDEX,
        {
            params: { employee: employee ?? "", month },
            options: { enabled: !!employee },
        },
    )
    return {
        ...res,
        transactionList: asArray<SalaryTransaction>(res.data),
    }
}
