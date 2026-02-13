import { format, isValid } from "date-fns"

export function formatDate(date: string | Date | undefined | null) {
    return date ? format(new Date(date), "yyyy.MM.dd") : ""
}
export function formatDateTime(date: string | undefined | Date | null) {
    return date ? format(new Date(date), "yyyy.MM.dd HH:mm:ss") : ""
}
export function safeParseDateInput(
    date: string | Date | undefined,
): Date | null {
    if (!date) return null

    try {
        const parsedDate = date instanceof Date ? date : new Date(date)
        return isValid(parsedDate) ? parsedDate : null
    } catch (error) {
        console.warn(`Error parsing date: ${date}`, error)
        return null
    }
}
