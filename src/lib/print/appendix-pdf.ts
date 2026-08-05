/**
 * Buyurtmaning chop etiladigan formalarini PDF qilib chizadi.
 *
 * Beshta forma, uchta blank:
 *   `classic`    — «Приложение», «… для проката», «…-Производство»: rekvizit
 *                  jadvali, texnik xususiyatlar, tovarlar, shartlar, imzolar;
 *   `draft`      — ichki qoralama: sarlavha, ogohlantirish yo'lagi va narx
 *                  jadvali, boshqa hech nima;
 *   `priceCheck` — narxni tekshirish: qisqa rekvizit va hujjatdagi tonna
 *                  narxini hisoblangani bilan yonma-yon qo'yadigan jadval.
 *
 * Tovarlar ko'p bo'lsa jadval keyingi sahifaga o'tadi va sarlavhasi takrorlanadi.
 */

import { fetchBase64 } from "@/lib/pdf/assets"
import {
    A4,
    CONTENT_WIDTH,
    createDocument,
    drawText,
    fillRect,
    line,
    lineHeight,
    rect,
    stampPageNumbers,
    textHeight,
    type FontStyle,
} from "@/lib/pdf/document"
import { formatNumber } from "@/lib/utils/format-number"
import type { jsPDF } from "jspdf"
import type { AppendixData } from "./appendix-types"
import { PRINT_VARIANTS } from "./appendix-variants"

const LOGO_URL = "/images/logo-print.png"
const LOGO_WIDTH = 58
const LOGO_HEIGHT = (LOGO_WIDTH * 264) / 1400

const LEFT = A4.margin
const RIGHT = A4.margin + CONTENT_WIDTH
const BOTTOM = A4.height - A4.margin
const HALF = CONTENT_WIDTH / 2

/** Hujayra ichki bo'shlig'i. */
const PAD = 1.5
/** Rekvizit jadvalidagi yorliq ustuni. */
const LABEL_W = 34

const BODY = 8.5
const SMALL = 7.5

/** Qoralamadagi ogohlantirish yo'lagi rangi. */
const WARNING_BG: [number, number, number] = [255, 252, 214]

/** Pul qiymati tijorat hujjatidagidek doim ikki xonali: `9 750.00`. */
const money = (val: number) =>
    formatNumber(val, {
        decimalScale: 2,
        fixedDecimalScale: true,
        isShowZero: true,
    })

/**
 * Narx uch xonagacha — u metr uchun hisoblanganda (вес × цена за тонну / 1000)
 * ikki xona yetmaydi va qog'ozda «кол-во × цена» summaga to'g'ri kelmay qoladi.
 */
const price = (val: number) =>
    formatNumber(val, { decimalScale: 3, isShowZero: true })

const amount = (val: number) =>
    formatNumber(val, { decimalScale: 3, isShowZero: true })

/**
 * Narx varaqlaridagi bo'sh katak. «Доставка» qatorida na og'irlik, na tonna
 * narxi bor — o'rniga nol yozilsa, u hisoblangandek ko'rinardi.
 */
const orDash = (val: number | undefined, format: (n: number) => string) =>
    val && val > 0 ? format(val) : "-"

/** `2026-07-23` → `23.07.2026`; noto'g'ri qiymat bo'lsa bo'sh qatorga aylanadi. */
function ruDate(value: string | null | undefined): string {
    if (!value) return ""
    const [y, m, d] = value.slice(0, 10).split("-")
    return y && m && d ? `${d}.${m}.${y}` : ""
}

/** `Nomi: Qiymati` qatorlarini juftliklarga ajratadi. */
function parseSpecs(source: string): { label: string; value: string }[] {
    return source
        .split("\n")
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((raw) => {
            const at = raw.indexOf(":")
            if (at === -1) return { label: raw, value: "" }
            return {
                label: raw.slice(0, at).trim(),
                value: raw.slice(at + 1).trim(),
            }
        })
}

type Cell = {
    /** Yorliq — qalin shriftda, qiymatdan oldin. */
    label?: string
    value?: string
    /** Yorliq qiymat bilan bir qatorda (aks holda ustida). */
    inline?: boolean
    labelWidth?: number
}

function cellHeight(doc: jsPDF, cell: Cell, width: number): number {
    const inner = width - PAD * 2
    const labelW = cell.labelWidth ?? LABEL_W

    if (cell.inline) {
        const valueH = textHeight(doc, cell.value ?? "", {
            size: BODY,
            maxWidth: inner - (cell.label ? labelW : 0),
        })
        const labelH = cell.label ? lineHeight(BODY) : 0
        return Math.max(valueH, labelH) + PAD * 2
    }

    const labelH = cell.label ? lineHeight(BODY) : 0
    const valueH =
        cell.value ?
            textHeight(doc, cell.value, { size: BODY, maxWidth: inner })
        :   0
    return labelH + valueH + PAD * 2
}

function drawCell(doc: jsPDF, cell: Cell, x: number, y: number, width: number) {
    const inner = width - PAD * 2
    const labelW = cell.labelWidth ?? LABEL_W
    const cursor = y + PAD

    if (cell.inline) {
        if (cell.label) {
            drawText(doc, cell.label, x + PAD, cursor, {
                size: BODY,
                style: "bold",
            })
        }
        drawText(
            doc,
            cell.value ?? "",
            x + PAD + (cell.label ? labelW : 0),
            cursor,
            {
                size: BODY,
                maxWidth: inner - (cell.label ? labelW : 0),
            },
        )
        return
    }

    let below = cursor
    if (cell.label) {
        below += drawText(doc, cell.label, x + PAD, below, {
            size: BODY,
            style: "bold",
        })
    }
    if (cell.value) {
        drawText(doc, cell.value, x + PAD, below, {
            size: BODY,
            maxWidth: inner,
        })
    }
}

/** Bir qatorni (bir yoki ikki hujayra) chegara bilan chizadi, balandligini qaytaradi. */
function drawRow(doc: jsPDF, y: number, cells: Cell[]): number {
    const width = CONTENT_WIDTH / cells.length
    const height = Math.max(
        ...cells.map((cell) => cellHeight(doc, cell, width)),
        lineHeight(BODY) + PAD * 2,
    )

    cells.forEach((cell, i) => {
        const x = LEFT + width * i
        rect(doc, x, y, width, height)
        drawCell(doc, cell, x, y, width)
    })

    return height
}

/* ------------------------------------------------------------------ *
 * Tovarlar jadvali — ustunlari formaga qarab har xil
 * ------------------------------------------------------------------ */

type Column = {
    title: string
    width: number
    align: "left" | "right" | "center"
}

/**
 * Kengliklar yig'indisi 172 mm (A4 minus chekkalar) bo'lishi shart.
 *
 * «Сумма» ustuni ataylab keng: yetti xonali summa («1 235 375.00») ikki
 * qatorga sinib ketmasligi kerak — qog'ozda aynan shu son o'qiladi.
 */
const classicColumns = (quantityTitle: string): Column[] => [
    { title: "№", width: 10, align: "center" },
    { title: "Наименование товара и типоразмер", width: 78, align: "left" },
    { title: "Ед. изм", width: 18, align: "center" },
    { title: quantityTitle, width: 20, align: "right" },
    { title: "Цена", width: 20, align: "right" },
    { title: "Сумма", width: 26, align: "right" },
]

const DRAFT_COLUMNS: Column[] = [
    { title: "№", width: 9, align: "center" },
    { title: "Наименование товара и типоразмер", width: 59, align: "left" },
    { title: "Вес 1пм", width: 19, align: "right" },
    { title: "Кол-во", width: 21, align: "right" },
    { title: "Цена за ТН", width: 20, align: "right" },
    { title: "Цена за М", width: 20, align: "right" },
    { title: "Сумма", width: 24, align: "right" },
]

const PRICE_CHECK_COLUMNS: Column[] = [
    { title: "№", width: 8, align: "center" },
    { title: "Наименование товара и типоразмер", width: 47, align: "left" },
    { title: "Вес 1пм", width: 15, align: "right" },
    { title: "Кол-во", width: 18, align: "right" },
    { title: "Цена за тн док", width: 20, align: "right" },
    { title: "Цена за ТН", width: 18, align: "right" },
    { title: "Цена за пм", width: 18, align: "right" },
    { title: "Сумма", width: 28, align: "right" },
]

/** Ustun boshlanadigan x koordinatasi. */
function columnX(columns: Column[], index: number): number {
    return LEFT + columns.slice(0, index).reduce((acc, c) => acc + c.width, 0)
}

/**
 * Qator balandligi. Nomi uzun bo'lsa qator baland bo'ladi, shuning uchun
 * chizishdan oldin o'lchanadi; ustun sarlavhasi ham ikki qatorli bo'lishi
 * mumkin («Кол-во ±10%»).
 */
function tableRowHeight(
    doc: jsPDF,
    columns: Column[],
    values: string[],
    style: FontStyle,
): number {
    return (
        Math.max(
            ...columns.map((column, i) =>
                textHeight(doc, values[i] ?? "", {
                    size: BODY,
                    style,
                    maxWidth: column.width - PAD * 2,
                }),
            ),
            lineHeight(BODY),
        ) +
        PAD * 2
    )
}

function drawTableRow(
    doc: jsPDF,
    columns: Column[],
    y: number,
    values: string[],
    style: FontStyle,
): number {
    const height = tableRowHeight(doc, columns, values, style)

    rect(doc, LEFT, y, CONTENT_WIDTH, height)

    columns.forEach((column, i) => {
        const x = columnX(columns, i)
        if (i > 0) line(doc, x, y, x, y + height)

        const align = column.align
        const textX =
            align === "left" ? x + PAD
            : align === "right" ? x + column.width - PAD
            : x + column.width / 2

        drawText(doc, values[i] ?? "", textX, y + PAD, {
            size: BODY,
            style,
            align,
            maxWidth: column.width - PAD * 2,
        })
    })

    return height
}

function drawTableHeader(doc: jsPDF, columns: Column[], y: number): number {
    return drawTableRow(
        doc,
        columns,
        y,
        columns.map((c) => c.title),
        "bold",
    )
}

/**
 * «Итого» qatori: ustunlar orasida chiziq yo'q, shuning uchun summa oxirgi
 * ustunga siqilmaydi — valyuta bilan birga o'ng chetga yoziladi.
 */
function drawTotalRow(
    doc: jsPDF,
    columns: Column[],
    y: number,
    total: string,
): number {
    const height = lineHeight(BODY) + PAD * 2
    rect(doc, LEFT, y, CONTENT_WIDTH, height)
    drawText(doc, "Итого:", columnX(columns, 1) + PAD, y + PAD, {
        size: BODY,
        style: "bold",
    })
    drawText(doc, total, RIGHT - PAD, y + PAD, {
        size: BODY,
        style: "bold",
        align: "right",
    })
    return height
}

/** Sarlavha + qatorlar + «Итого»; sahifa to'lsa sarlavha qaytadan chiziladi. */
function drawItemsTable(
    doc: jsPDF,
    columns: Column[],
    startY: number,
    rows: string[][],
    total: string,
): number {
    let y = startY + drawTableHeader(doc, columns, startY)

    rows.forEach((values) => {
        if (y + tableRowHeight(doc, columns, values, "normal") > BOTTOM) {
            doc.addPage()
            y = A4.margin
            y += drawTableHeader(doc, columns, y)
        }
        y += drawTableRow(doc, columns, y, values, "normal")
    })

    if (y + lineHeight(BODY) + PAD * 2 > BOTTOM) {
        doc.addPage()
        y = A4.margin
        y += drawTableHeader(doc, columns, y)
    }
    return y + drawTotalRow(doc, columns, y, total)
}

/* ------------------------------------------------------------------ *
 * Umumiy bo'laklar
 * ------------------------------------------------------------------ */

/** Yarim kenglikdagi «yorliq … qiymat» + tagiga chiziq bloki. */
function drawUnderlinedField(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    label: string,
    value: string,
): number {
    drawText(doc, label, x, y, { size: BODY, style: "bold" })
    const height = drawText(doc, value, x + width - 2, y + 1.5, {
        size: BODY,
        align: "right",
        maxWidth: width - 30,
    })
    const bottom = y + Math.max(height + 1.5, lineHeight(BODY)) + 1
    line(doc, x, bottom, x + width, bottom)
    return bottom - y + 1.5
}

/**
 * Logotip va o'ng tarafdagi hujjat raqamlari. Yangi `y` ni qaytaradi.
 *
 * O'ng ustunda faqat qisqa qiymatlar turadi (sana, raqam): u yerda yorliqqa
 * bor-yo'g'i 70 mm qoladi, uzun matn yorliqning ustiga chiqib ketadi.
 */
async function drawLetterhead(doc: jsPDF, data: AppendixData): Promise<number> {
    const y = A4.margin
    const logo = await fetchBase64(LOGO_URL).catch(() => null)

    if (logo) {
        doc.addImage(
            `data:image/png;base64,${logo}`,
            "PNG",
            LEFT,
            y,
            LOGO_WIDTH,
            LOGO_HEIGHT,
        )
    }

    const rows: [string, string][] = [
        ["ДАТА ОТПРАВКИ:", ruDate(data.shipmentDate)],
        [
            "КОНТРАКТ № / ЛОТ №:",
            // Namunadagidek: biri bo'sh bo'lsa ham ajratuvchi chiziqcha qoladi.
            data.contractNumber || data.lotNumber ?
                `${data.contractNumber} / ${data.lotNumber}`.trim()
            :   "",
        ],
        [
            "ПРИЛОЖЕНИЕ №:",
            [
                data.appendixNumber,
                data.appendixVersion && `(${data.appendixVersion})`,
            ]
                .filter(Boolean)
                .join(" "),
        ],
    ]

    let cursor = y
    rows.forEach(([label, value]) => {
        drawText(doc, label, LEFT + 100, cursor, { size: BODY, style: "bold" })
        cursor += Math.max(
            drawText(doc, value, RIGHT, cursor, {
                size: BODY,
                align: "right",
                maxWidth: RIGHT - LEFT - 102,
            }),
            lineHeight(BODY),
        )
    })

    return Math.max(y + LOGO_HEIGHT, cursor) + 8
}

/** «Условие оплаты» va «Особые условия» — ikki ustun. */
function drawTermsColumns(doc: jsPDF, data: AppendixData, y: number): number {
    const columns: [number, number, string, string, string][] = [
        [
            LEFT,
            HALF - 2,
            "Условие оплаты",
            data.paymentTermsTitle,
            data.paymentTermsText,
        ],
        [LEFT + HALF, HALF, "Особые условия", "", data.specialTerms],
    ]

    let bottom = y
    columns.forEach(([x, width, title, subtitle, body]) => {
        let cursor = y
        cursor += drawText(doc, title, x, cursor, { size: BODY, style: "bold" })
        cursor += 1
        if (subtitle) {
            cursor += drawText(doc, subtitle, x, cursor, { size: SMALL })
        }
        cursor += drawText(doc, body, x, cursor, {
            size: SMALL,
            maxWidth: width - 2,
        })
        bottom = Math.max(bottom, cursor)
    })

    return bottom
}

/* ------------------------------------------------------------------ *
 * Blanklar
 * ------------------------------------------------------------------ */

/** «Приложение», «… для проката», «…-Производство». */
async function drawClassic(
    doc: jsPDF,
    data: AppendixData,
    quantityTitle: string,
) {
    let y = await drawLetterhead(doc, data)

    /* ---- Rekvizitlar jadvali ---- */
    y += drawRow(doc, y, [
        { label: "Покупатель:", value: data.buyerName, inline: true },
    ])
    y += drawRow(doc, y, [
        {
            label: "Срок поставки по:",
            value:
                data.deliveryDeadline ?
                    `${ruDate(data.deliveryDeadline)} включительно`
                :   "",
            inline: true,
        },
        { label: "Условие поставки:", value: data.deliveryTerms, inline: true },
    ])
    y += drawRow(doc, y, [
        { label: "Поставщик:", value: data.seller },
        { label: "Грузополучатель:", value: data.consignee },
    ])
    y += drawRow(doc, y, [
        {
            label: "Производитель:",
            value: data.manufacturer,
            inline: true,
            labelWidth: 26,
        },
        { label: "Направление:", value: data.direction, inline: true },
    ])
    y += drawRow(doc, y, [
        {
            label: "Описание товара:",
            value: data.goodsDescription,
            inline: true,
        },
    ])

    /* ---- Texnik xususiyatlar (chegarasiz, ikki ustun) ---- */
    y += 4
    const specColumns = [
        parseSpecs(data.specsLeft),
        parseSpecs(data.specsRight),
    ]
    const specTop = y

    specColumns.forEach((rows, columnIndex) => {
        const x = LEFT + HALF * columnIndex
        let cursor = specTop
        cursor += drawText(doc, "Технические характеристики:", x, cursor, {
            size: BODY,
            style: "bold",
        })
        rows.forEach((row) => {
            drawText(doc, row.label, x, cursor, { size: BODY, style: "bold" })
            cursor += drawText(doc, row.value, x + 52, cursor, {
                size: BODY,
                style: "bold",
                maxWidth: HALF - 54,
            })
        })
    })

    y =
        specTop +
        Math.max(
            ...specColumns.map((rows) => (rows.length + 1) * lineHeight(BODY)),
        ) +
        6

    /* ---- Tovarlar jadvali ---- */
    const columns = classicColumns(quantityTitle)
    y = drawItemsTable(
        doc,
        columns,
        y,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            item.unit,
            amount(item.quantity),
            price(item.price),
            money(item.total),
        ]),
        `${money(data.total)} ${data.currency}`.trim(),
    )

    /* ---- Shartlar ---- */
    const conditionsHeight =
        14 +
        Math.max(
            textHeight(doc, data.paymentTermsText, {
                size: SMALL,
                maxWidth: HALF - 4,
            }),
            textHeight(doc, data.specialTerms, {
                size: SMALL,
                maxWidth: HALF - 4,
            }),
        ) +
        30
    if (y + conditionsHeight > BOTTOM) {
        doc.addPage()
        y = A4.margin
    }

    y += 4
    y +=
        Math.max(
            drawUnderlinedField(
                doc,
                LEFT,
                y,
                HALF - 2,
                "Упаковка",
                data.packaging,
            ),
            drawUnderlinedField(
                doc,
                LEFT + HALF,
                y,
                HALF,
                "Маркировка",
                data.marking,
            ),
        ) + 1

    y = drawTermsColumns(doc, data, y) + 2
    line(doc, LEFT, y, RIGHT, y)
    y += 1.5

    drawText(doc, "конец страницы", LEFT, y, { size: SMALL })
    drawText(doc, "Исполнитель:", LEFT + 100, y, { size: SMALL })
    drawText(doc, data.executor, RIGHT, y, { size: SMALL, align: "right" })

    /* ---- Imzo joylari ---- */
    y += 14
    drawText(doc, "ПРОДАВЕЦ", LEFT + 10, y, { size: 10, style: "bold" })
    drawText(doc, "ПОКУПАТЕЛЬ", LEFT + HALF + 20, y, {
        size: 10,
        style: "bold",
    })
}

const DRAFT_NOTE = [
    "Цены подготовлены для внутреннего использования, не для передачи.",
    "Укажите |Цену за ТН| в Excel — система рассчитает цену за метр.",
    "Полученные значения используйте для внесения в систему учёта заказов.",
].join("\n")

/**
 * «Draft» — narxni tayyorlash uchun ichki varaq.
 *
 * Rekvizit ham, ГОСТ ham, imzo ham yo'q: bu qog'oz xaridorga ketmaydi, unda
 * faqat tonna narxini metrga aylantiradigan raqamlar bor. Shuning uchun
 * yuqorisida sariq ogohlantirish yo'lagi turadi.
 */
async function drawDraft(doc: jsPDF, data: AppendixData) {
    let y = await drawLetterhead(doc, data)

    // Xaridor — alohida qatorda, sarlavhaning tor o'ng ustunida emas: firma
    // nomlari uzun va u yerda yorliq ustiga chiqib ketardi.
    y += drawRow(doc, y, [
        { label: "Покупатель:", value: data.buyerName, inline: true },
    ])
    y += 4

    const noteHeight =
        textHeight(doc, DRAFT_NOTE, {
            size: BODY,
            style: "bold",
            maxWidth: CONTENT_WIDTH - 8,
        }) +
        PAD * 4
    fillRect(doc, LEFT, y, CONTENT_WIDTH, noteHeight, WARNING_BG)
    drawText(doc, DRAFT_NOTE, LEFT + CONTENT_WIDTH / 2, y + PAD * 2, {
        size: BODY,
        style: "bold",
        align: "center",
        maxWidth: CONTENT_WIDTH - 8,
    })
    y += noteHeight + 5

    drawItemsTable(
        doc,
        DRAFT_COLUMNS,
        y,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            orDash(item.weightPerMeter, amount),
            amount(item.quantityMeters ?? item.quantity),
            orDash(item.pricePerTon, money),
            orDash(item.pricePerMeter ?? item.price, price),
            money(item.total),
        ]),
        `${money(data.total)} ${data.currency}`.trim(),
    )
}

/**
 * «Проверка цены» — hujjatdagi tonna narxi hisoblangani bilan yonma-yon.
 *
 * Ikki ustun («Цена за тн док» va «Цена за ТН») bir xil bo'lishi kerak; farq
 * chiqsa demak qatorga narx qo'lda kiritilgan yoki tovar kartochkasidagi
 * og'irlik o'zgargan. Xaridorga ketmaydi, shuning uchun ГОСТ va imzolar yo'q.
 */
async function drawPriceCheck(doc: jsPDF, data: AppendixData) {
    let y = await drawLetterhead(doc, data)

    y += drawRow(doc, y, [
        { label: "Покупатель:", value: data.buyerName, inline: true },
    ])
    y += drawRow(doc, y, [
        {
            label: "Срок поставки по:",
            value:
                data.deliveryDeadline ?
                    `${ruDate(data.deliveryDeadline)} включительно`
                :   "",
            inline: true,
        },
        { label: "Условие поставки:", value: data.deliveryTerms, inline: true },
    ])
    // Bu varaqda joyni tejash uchun grúzopoluchatel bir qatorga yig'iladi.
    y += drawRow(doc, y, [
        {
            label: "Грузополучатель:",
            value: data.consignee
                .split("\n")
                .map((part) => part.trim())
                .filter(Boolean)
                .join(" ; "),
        },
    ])

    y += 4
    y = drawItemsTable(
        doc,
        PRICE_CHECK_COLUMNS,
        y,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            orDash(item.weightPerMeter, amount),
            amount(item.quantityMeters ?? item.quantity),
            orDash(item.pricePerTonDoc, money),
            orDash(item.pricePerTon, money),
            orDash(item.pricePerMeter ?? item.price, price),
            money(item.total),
        ]),
        `${money(data.total)} ${data.currency}`.trim(),
    )

    y += 6
    if (y + 40 > BOTTOM) {
        doc.addPage()
        y = A4.margin
    }
    drawTermsColumns(doc, data, y)
}

export async function buildAppendixPdf(data: AppendixData): Promise<jsPDF> {
    const doc = await createDocument()
    const variant = PRINT_VARIANTS[data.variant] ?? PRINT_VARIANTS.appendix

    if (variant.layout === "draft") await drawDraft(doc, data)
    else if (variant.layout === "priceCheck") await drawPriceCheck(doc, data)
    else await drawClassic(doc, data, variant.quantityTitle ?? "Кол-во")

    stampPageNumbers(doc)
    return doc
}
