export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export type OptionIdNumber = {
    name: string
    id: number
}
export type OptionIdString = {
    name: string
    id: string
}

export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
