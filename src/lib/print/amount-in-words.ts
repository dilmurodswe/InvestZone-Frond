/**
 * Summani ruscha so'z bilan yozadi: «Ноль долларов 00 центов».
 *
 * Yuk xatida bu majburiy rekvizit — raqamni keyin tuzatib bo'lmasligi uchun u
 * so'z bilan takrorlanadi. Rus tilida son bilan kelgan otning uch shakli bor
 * (доллар / доллара / долларов) va u oxirgi ikki raqamga qarab tanlanadi.
 */

type Forms = [one: string, few: string, many: string]

type CurrencyWords = {
    /** «доллар / доллара / долларов» */
    major: Forms
    /** «цент / цента / центов» */
    minor: Forms
    /** Butun qismning grammatik jinsi: сум — erkak, гривна — ayol. */
    majorFeminine?: boolean
    minorFeminine?: boolean
}

const CURRENCIES: Record<string, CurrencyWords> = {
    USD: {
        major: ["доллар", "доллара", "долларов"],
        minor: ["цент", "цента", "центов"],
    },
    EUR: {
        major: ["евро", "евро", "евро"],
        minor: ["цент", "цента", "центов"],
    },
    RUB: {
        major: ["рубль", "рубля", "рублей"],
        minor: ["копейка", "копейки", "копеек"],
        minorFeminine: true,
    },
    UZS: {
        major: ["сум", "сума", "сумов"],
        minor: ["тийин", "тийина", "тийинов"],
    },
}

const DEFAULT_CURRENCY: CurrencyWords = {
    major: ["", "", ""],
    minor: ["", "", ""],
}

const ONES_MALE = [
    "ноль",
    "один",
    "два",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
]
const ONES_FEMALE = [...ONES_MALE]
ONES_FEMALE[1] = "одна"
ONES_FEMALE[2] = "две"

const TEENS = [
    "десять",
    "одиннадцать",
    "двенадцать",
    "тринадцать",
    "четырнадцать",
    "пятнадцать",
    "шестнадцать",
    "семнадцать",
    "восемнадцать",
    "девятнадцать",
]
const TENS = [
    "",
    "",
    "двадцать",
    "тридцать",
    "сорок",
    "пятьдесят",
    "шестьдесят",
    "семьдесят",
    "восемьдесят",
    "девяносто",
]
const HUNDREDS = [
    "",
    "сто",
    "двести",
    "триста",
    "четыреста",
    "пятьсот",
    "шестьсот",
    "семьсот",
    "восемьсот",
    "девятьсот",
]

/** Uch xonalik guruh so'z bilan. */
function chunkToWords(value: number, feminine: boolean): string[] {
    const words: string[] = []
    const hundreds = Math.floor(value / 100)
    const rest = value % 100
    if (hundreds) words.push(HUNDREDS[hundreds])
    if (rest >= 10 && rest < 20) {
        words.push(TEENS[rest - 10])
    } else {
        const tens = Math.floor(rest / 10)
        const ones = rest % 10
        if (tens) words.push(TENS[tens])
        if (ones) words.push((feminine ? ONES_FEMALE : ONES_MALE)[ones])
    }
    return words
}

/** 1 → «рубль», 2 → «рубля», 5 → «рублей». */
export function plural(value: number, forms: Forms): string {
    const mod100 = Math.abs(value) % 100
    const mod10 = mod100 % 10
    if (mod100 >= 11 && mod100 <= 14) return forms[2]
    if (mod10 === 1) return forms[0]
    if (mod10 >= 2 && mod10 <= 4) return forms[1]
    return forms[2]
}

const SCALES: { forms: Forms; feminine: boolean }[] = [
    { forms: ["", "", ""], feminine: false },
    { forms: ["тысяча", "тысячи", "тысяч"], feminine: true },
    { forms: ["миллион", "миллиона", "миллионов"], feminine: false },
    { forms: ["миллиард", "миллиарда", "миллиардов"], feminine: false },
]

/** Butun sonni so'zga aylantiradi (valyutasiz). */
export function integerToWords(value: number, feminine = false): string {
    const whole = Math.floor(Math.abs(value))
    if (whole === 0) return ONES_MALE[0]

    const groups: number[] = []
    let rest = whole
    while (rest > 0) {
        groups.push(rest % 1000)
        rest = Math.floor(rest / 1000)
    }

    const words: string[] = []
    for (let scale = groups.length - 1; scale >= 0; scale--) {
        const group = groups[scale]
        if (!group) continue
        const meta = SCALES[scale] ?? SCALES[SCALES.length - 1]
        words.push(
            ...chunkToWords(group, scale === 0 ? feminine : meta.feminine),
        )
        if (scale > 0) words.push(plural(group, meta.forms))
    }
    return words.join(" ")
}

/**
 * «0» + `USD` → «Ноль долларов 00 центов».
 *
 * Tiyin qismi ataylab raqamda qoladi — yuk xatlarida shunday qabul qilingan va
 * uni o'qish oson: «сто двадцать долларов 05 центов».
 */
export function amountInWords(value: number, currencyCode: string): string {
    const currency = CURRENCIES[currencyCode?.toUpperCase()] ?? DEFAULT_CURRENCY
    const rounded = Math.round(Math.abs(value) * 100)
    const major = Math.floor(rounded / 100)
    const minor = rounded % 100

    const words = integerToWords(major, currency.majorFeminine)
    const head = words.charAt(0).toUpperCase() + words.slice(1)
    const majorWord = plural(major, currency.major)
    const minorWord = plural(minor, currency.minor)

    return [head, majorWord, String(minor).padStart(2, "0"), minorWord]
        .filter(Boolean)
        .join(" ")
}

/**
 * «Всего наименований 3, на сумму 1 200.00 доллар» — bu qatorda valyuta
 * nomi son bilan kelishmaydi, u lug'aviy shaklda turadi.
 */
export function currencyName(currencyCode: string): string {
    return CURRENCIES[currencyCode?.toUpperCase()]?.major[0] ?? currencyCode
}
