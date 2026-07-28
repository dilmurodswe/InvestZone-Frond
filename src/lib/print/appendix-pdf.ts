/**
 * «Приложение» formasini PDF qilib chizadi.
 *
 * Tuzilishi namunadagi (Приложение-1267) hujjatga mos: sarlavha + rekvizitlar
 * jadvali, texnik xususiyatlar, tovarlar jadvali, shartlar va imzo joylari.
 * Tovarlar ko'p bo'lsa jadval keyingi sahifaga o'tadi va sarlavhasi takrorlanadi.
 */

import { fetchBase64 } from "@/lib/pdf/assets"
import {
    A4,
    CONTENT_WIDTH,
    createDocument,
    drawText,
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
    let cursor = y + PAD

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

    if (cell.label) {
        cursor += drawText(doc, cell.label, x + PAD, cursor, {
            size: BODY,
            style: "bold",
        })
    }
    if (cell.value) {
        drawText(doc, cell.value, x + PAD, cursor, {
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

const COLUMNS = [
    { title: "№", width: 10, align: "center" as const },
    {
        title: "Наименование товара и типоразмер",
        width: 82,
        align: "left" as const,
    },
    { title: "Ед. изм", width: 18, align: "center" as const },
    { title: "Кол-во", width: 20, align: "right" as const },
    { title: "Цена", width: 20, align: "right" as const },
    { title: "Сумма", width: 22, align: "right" as const },
]

/** Ustun boshlanadigan x koordinatasi. */
function columnX(index: number): number {
    return LEFT + COLUMNS.slice(0, index).reduce((acc, c) => acc + c.width, 0)
}

/** Nomi uzun bo'lsa qator baland bo'ladi — chizishdan oldin o'lchanadi. */
function tableRowHeight(
    doc: jsPDF,
    values: string[],
    style: FontStyle,
): number {
    const nameIndex = 1
    return (
        Math.max(
            textHeight(doc, values[nameIndex] ?? "", {
                size: BODY,
                style,
                maxWidth: COLUMNS[nameIndex].width - PAD * 2,
            }),
            lineHeight(BODY),
        ) +
        PAD * 2
    )
}

function drawTableRow(
    doc: jsPDF,
    y: number,
    values: string[],
    style: FontStyle,
): number {
    const height = tableRowHeight(doc, values, style)

    rect(doc, LEFT, y, CONTENT_WIDTH, height)

    COLUMNS.forEach((column, i) => {
        const x = columnX(i)
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

/**
 * «Итого» qatori: ustunlar orasida chiziq yo'q, shuning uchun summa oxirgi
 * ustunga siqilmaydi — valyuta bilan birga o'ng chetga yoziladi.
 */
function drawTotalRow(doc: jsPDF, y: number, total: string): number {
    const height = lineHeight(BODY) + PAD * 2
    rect(doc, LEFT, y, CONTENT_WIDTH, height)
    drawText(doc, "Итого:", columnX(1) + PAD, y + PAD, {
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

function drawTableHeader(doc: jsPDF, y: number): number {
    return drawTableRow(
        doc,
        y,
        COLUMNS.map((c) => c.title),
        "bold",
    )
}

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

export async function buildAppendixPdf(data: AppendixData): Promise<jsPDF> {
    const doc = await createDocument()
    const logo = await fetchBase64(LOGO_URL).catch(() => null)

    let y = A4.margin

    /* ---- Sarlavha: logo + hujjat raqamlari ---- */
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

    const headerRows: [string, string][] = [
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
    headerRows.forEach(([label, value], i) => {
        const rowY = y + i * lineHeight(BODY)
        drawText(doc, label, LEFT + 100, rowY, { size: BODY, style: "bold" })
        drawText(doc, value, RIGHT, rowY, { size: BODY, align: "right" })
    })

    y = Math.max(y + LOGO_HEIGHT, y + headerRows.length * lineHeight(BODY)) + 8

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
    y += drawTableHeader(doc, y)

    data.items.forEach((item, index) => {
        const values = [
            String(index + 1),
            item.name,
            item.unit,
            formatNumber(item.quantity, { decimalScale: 3, isShowZero: true }),
            price(item.price),
            money(item.total),
        ]
        // Qator sahifaga sig'masa — yangi sahifa va jadval sarlavhasi qaytadan.
        if (y + tableRowHeight(doc, values, "normal") > BOTTOM) {
            doc.addPage()
            y = A4.margin
            y += drawTableHeader(doc, y)
        }
        y += drawTableRow(doc, y, values, "normal")
    })

    const total = `${money(data.total)} ${data.currency}`.trim()
    if (y + lineHeight(BODY) + PAD * 2 > BOTTOM) {
        doc.addPage()
        y = A4.margin
        y += drawTableHeader(doc, y)
    }
    y += drawTotalRow(doc, y, total)

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
    const packagingHeight = Math.max(
        drawUnderlinedField(doc, LEFT, y, HALF - 2, "Упаковка", data.packaging),
        drawUnderlinedField(
            doc,
            LEFT + HALF,
            y,
            HALF,
            "Маркировка",
            data.marking,
        ),
    )
    y += packagingHeight + 1

    const conditionsTop = y
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
    let conditionsBottom = conditionsTop
    columns.forEach(([x, width, title, subtitle, body]) => {
        let cursor = conditionsTop
        cursor += drawText(doc, title, x, cursor, { size: BODY, style: "bold" })
        cursor += 1
        if (subtitle) {
            cursor += drawText(doc, subtitle, x, cursor, { size: SMALL })
        }
        cursor += drawText(doc, body, x, cursor, {
            size: SMALL,
            maxWidth: width - 2,
        })
        conditionsBottom = Math.max(conditionsBottom, cursor)
    })

    y = conditionsBottom + 2
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

    stampPageNumbers(doc)
    return doc
}
