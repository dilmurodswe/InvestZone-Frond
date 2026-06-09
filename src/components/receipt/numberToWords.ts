// Number to words converter for Uzbek/Russian receipts
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${day}.${month}.${year} ${hours}:${minutes}`
}

export function numberToWordsUzCyrillic(
    num: number,
    currency: "uzs" | "usd" = "uzs",
): string {
    if (num === 0) return currency === "uzs" ? "нол сўм" : "нол доллар"

    const ones = [
        "",
        "бир",
        "икки",
        "уч",
        "тўрт",
        "беш",
        "олти",
        "етти",
        "саккиз",
        "тўққиз",
    ]
    const tens = [
        "",
        "ўн",
        "йигирма",
        "ўттиз",
        "қирқ",
        "эллик",
        "олтмиш",
        "етмиш",
        "саксон",
        "тўқсон",
    ]
    const hundreds = [
        "",
        "юз",
        "икки юз",
        "уч юз",
        "тўрт юз",
        "беш юз",
        "олти юз",
        "етти юз",
        "саккиз юз",
        "тўққиз юз",
    ]

    function convertChunk(n: number): string {
        if (n === 0) return ""

        const h = Math.floor(n / 100)
        const t = Math.floor((n % 100) / 10)
        const o = n % 10

        const parts = []
        if (h > 0) parts.push(hundreds[h])
        if (t > 0) parts.push(tens[t])
        if (o > 0) parts.push(ones[o])

        return parts.join(" ")
    }

    const billion = Math.floor(num / 1000000000)
    const million = Math.floor((num % 1000000000) / 1000000)
    const thousand = Math.floor((num % 1000000) / 1000)
    const remainder = num % 1000

    const parts = []

    if (billion > 0) {
        parts.push(convertChunk(billion) + " миллиард")
    }
    if (million > 0) {
        parts.push(convertChunk(million) + " миллион")
    }
    if (thousand > 0) {
        parts.push(convertChunk(thousand) + " минг")
    }
    if (remainder > 0) {
        parts.push(convertChunk(remainder))
    }

    const currencyWord = currency === "uzs" ? "сўм" : "доллар"
    return parts.join(" ").trim() + " " + currencyWord
}

export function formatAmount(
    amount: number,
    currency: "uzs" | "usd" = "uzs",
): string {
    const formatted = new Intl.NumberFormat("uz-UZ").format(amount)
    const currencySymbol = currency === "uzs" ? "сўм" : "$"
    return `${formatted} ${currencySymbol}`
}
