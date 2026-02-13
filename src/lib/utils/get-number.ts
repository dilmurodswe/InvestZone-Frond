export function getNumber(val: unknown): number {
    if (typeof val === "number") return val

    if (typeof val === "boolean") return val ? 1 : 0

    if (typeof val === "string") {
        // убираем пробелы, запятые, валюты и прочий мусор
        const cleaned = val
            .trim()
            .replace(/,/g, "") // тысячи: "2,500"
            .replace(/[^\d.-]/g, "") // всё, что не число/точка/минус

        return Number(cleaned)
    }

    if (val == null) return 0

    // попытка для объектов, дат и прочего
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Number((val as any).valueOf())
    } catch {
        return 0
    }
}
