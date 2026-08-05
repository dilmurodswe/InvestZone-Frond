/**
 * Otgruzkaning chop etiladigan formalarini PDF qilib chizadi.
 *
 * To'rtta blank:
 *   `expenseInvoice` — «Расходная накладная»: sarlavha, tomonlar, jadval,
 *                      summa so'z bilan, «Отпустил / Получил»;
 *   `ttnUzNew`       — ТТН (Узбекистан, новая): yotiq varaq, yuk va
 *                      avtotashish ustunlari, «Масса брутто/нетто»;
 *   `ttn1T`          — Типовая форма № 1-т: davlat blanki, kodlar katagi va
 *                      qo'l bilan to'ldiriladigan pastki qism;
 *   `ttnLetterhead`  — firma blankidagi ТТН (oddiy, «Весовая», «Прокат»);
 *   `ttnUzUnion`     — qisqartirilgan ТТН, muhr va imzo joyi bilan.
 */

import { fetchBase64 } from "@/lib/pdf/assets"
import {
    A4,
    createDocument,
    drawText,
    line,
    lineHeight,
    pageSize,
    rect,
    stampPageNumbers,
    textHeight,
    type FontStyle,
} from "@/lib/pdf/document"
import { formatNumber } from "@/lib/utils/format-number"
import type { jsPDF } from "jspdf"
import { amountInWords, currencyName } from "./amount-in-words"
import type { DemandData } from "./demand-types"
import { DEMAND_VARIANTS } from "./demand-variants"

const LOGO_URL = "/images/logo-print.png"
/**
 * Muhr va imzo — ixtiyoriy. Fayl bo'lmasa qog'ozda ularning joyi bo'sh
 * qoladi: shtamp qo'lda bosiladi.
 */
const STAMP_URL = "/images/stamp.png"
const SIGNATURE_URL = "/images/signature.png"

const LOGO_WIDTH = 58
const LOGO_HEIGHT = (LOGO_WIDTH * 264) / 1400

const PAD = 1.5
const BODY = 8.5
const SMALL = 7.5
const TINY = 6.5

const money = (val: number) =>
    formatNumber(val, {
        decimalScale: 2,
        fixedDecimalScale: true,
        isShowZero: true,
    })
const amount = (val: number) =>
    formatNumber(val, { decimalScale: 3, isShowZero: true })

/** `2026-08-05` → `05.08.2026`. */
function ruDate(value: string | null | undefined): string {
    if (!value) return ""
    const [y, m, d] = value.slice(0, 10).split("-")
    return y && m && d ? `${d}.${m}.${y}` : ""
}

/**
 * Varaq chegaralari — tik va yotiq uchun bir xil hisoblanadi.
 *
 * Tip ataylab yozilgan: `A4.margin` — `as const` bo'lgani uchun uning turi
 * `19` degan aniq son, va chiqarilgan tipda `top` ham `19` bo'lib qolardi —
 * `let y = box.top; y += 30` yig'ilmay qolgandi.
 */
type Box = {
    left: number
    right: number
    top: number
    bottom: number
    width: number
}

function geometry(landscape: boolean): Box {
    const { width, height } = pageSize(landscape)
    return {
        left: A4.margin,
        right: width - A4.margin,
        top: A4.margin,
        bottom: height - A4.margin,
        width: width - A4.margin * 2,
    }
}

/* ------------------------------------------------------------------ *
 * Jadval
 * ------------------------------------------------------------------ */

type Align = "left" | "right" | "center"

type Leaf = { title: string; width: number; align?: Align }
/** Ustun ikkiga bo'linishi mumkin: «Масса, нт» → «брутто | нетто». */
type Column = Leaf & { children?: Leaf[] }

const leaves = (columns: Column[]): Leaf[] =>
    columns.flatMap((column) => column.children ?? [column])

const totalWidth = (columns: Column[]) =>
    columns.reduce((acc, c) => acc + widthOf(c), 0)

const widthOf = (column: Column) =>
    column.children ?
        column.children.reduce((acc, c) => acc + c.width, 0)
    :   column.width

/**
 * Jadval sarlavhasi. Ikki yarusli ustun bo'lsa balandlik ikkiga bo'linadi:
 * yuqorida umumiy nom, pastda ikkita bo'lagi.
 */
function drawHeader(
    doc: jsPDF,
    box: Box,
    y: number,
    columns: Column[],
    size = SMALL,
): number {
    const split = columns.some((c) => c.children)
    const rowH = Math.max(
        ...columns.map((column) =>
            textHeight(doc, column.title, {
                size,
                style: "bold",
                maxWidth: widthOf(column) - PAD * 2,
            }),
        ),
        lineHeight(size),
    )
    const childH =
        split ?
            Math.max(
                ...leaves(columns).map((leaf) =>
                    textHeight(doc, leaf.title, {
                        size,
                        style: "bold",
                        maxWidth: leaf.width - PAD * 2,
                    }),
                ),
                lineHeight(size),
            )
        :   0
    const height = rowH + childH + PAD * 2

    rect(doc, box.left, y, totalWidth(columns), height)

    let x = box.left
    columns.forEach((column, i) => {
        const w = widthOf(column)
        if (i > 0) line(doc, x, y, x, y + height)

        if (column.children) {
            // Umumiy nom yuqori yarusda, bo'laklari — pastda.
            drawText(doc, column.title, x + w / 2, y + PAD, {
                size,
                style: "bold",
                align: "center",
                maxWidth: w - PAD * 2,
            })
            const divider = y + rowH + PAD
            line(doc, x, divider, x + w, divider)
            let childX = x
            column.children.forEach((child, ci) => {
                if (ci > 0) line(doc, childX, divider, childX, y + height)
                drawText(
                    doc,
                    child.title,
                    childX + child.width / 2,
                    divider + PAD / 2,
                    {
                        size,
                        style: "bold",
                        align: "center",
                        maxWidth: child.width - PAD * 2,
                    },
                )
                childX += child.width
            })
        } else {
            drawText(doc, column.title, x + w / 2, y + PAD, {
                size,
                style: "bold",
                align: "center",
                maxWidth: w - PAD * 2,
            })
        }
        x += w
    })

    return height
}

function rowHeight(
    doc: jsPDF,
    cols: Leaf[],
    values: string[],
    size: number,
    style: FontStyle,
): number {
    return (
        Math.max(
            ...cols.map((col, i) =>
                textHeight(doc, values[i] ?? "", {
                    size,
                    style,
                    maxWidth: col.width - PAD * 2,
                }),
            ),
            lineHeight(size),
        ) +
        PAD * 2
    )
}

function drawRow(
    doc: jsPDF,
    box: Box,
    y: number,
    cols: Leaf[],
    values: string[],
    { size = BODY, style = "normal" as FontStyle } = {},
): number {
    const height = rowHeight(doc, cols, values, size, style)
    const width = cols.reduce((acc, c) => acc + c.width, 0)
    rect(doc, box.left, y, width, height)

    let x = box.left
    cols.forEach((col, i) => {
        if (i > 0) line(doc, x, y, x, y + height)
        const align = col.align ?? "center"
        const textX =
            align === "left" ? x + PAD
            : align === "right" ? x + col.width - PAD
            : x + col.width / 2
        drawText(doc, values[i] ?? "", textX, y + PAD, {
            size,
            style,
            align,
            maxWidth: col.width - PAD * 2,
        })
        x += col.width
    })
    return height
}

/**
 * «Всего» qatori uchun ustunlar: birinchi ikkitasi qo'shilib ketadi.
 *
 * «№» katagi 8 mm — unda «Всего» ikki bo'lakka sinib qolardi, namunadagi
 * qog'ozda esa u chap chetdan boshlanib jadval nomi ostiga cho'ziladi.
 */
function mergedFirst(cols: Leaf[], span = 2): Leaf[] {
    const width = cols.slice(0, span).reduce((acc, c) => acc + c.width, 0)
    return [{ title: "", width, align: "left" }, ...cols.slice(span)]
}

/** Sarlavha + qatorlar; sahifa to'lsa sarlavha keyingisida takrorlanadi. */
function drawTable(
    doc: jsPDF,
    box: Box,
    startY: number,
    columns: Column[],
    rows: string[][],
    { size = BODY, headerSize = SMALL } = {},
): number {
    const cols = leaves(columns)
    let y = startY + drawHeader(doc, box, startY, columns, headerSize)

    rows.forEach((values) => {
        if (y + rowHeight(doc, cols, values, size, "normal") > box.bottom) {
            doc.addPage()
            y = box.top
            y += drawHeader(doc, box, y, columns, headerSize)
        }
        y += drawRow(doc, box, y, cols, values, { size })
    })

    return y
}

/* ------------------------------------------------------------------ *
 * Umumiy bo'laklar
 * ------------------------------------------------------------------ */

/** `Yorliq: qiymat` qatorlari ustuni. Yangi `y` ni qaytaradi. */
function drawLines(
    doc: jsPDF,
    x: number,
    y: number,
    rows: [label: string, value: string][],
    { size = BODY, width = 120, bold = false } = {},
): number {
    let cursor = y
    rows.forEach(([label, value]) => {
        const text = value ? `${label} ${value}` : label
        cursor += drawText(doc, text, x, cursor, {
            size,
            style: bold ? "bold" : "normal",
            maxWidth: width,
        })
    })
    return cursor
}

/** Chizig'i bilan to'ldiriladigan joy: «Отпустил ______». */
function drawFillIn(
    doc: jsPDF,
    x: number,
    y: number,
    label: string,
    width: number,
    { size = BODY } = {},
) {
    const labelWidth =
        doc.getStringUnitWidth(label) * (size / doc.internal.scaleFactor) + 2
    drawText(doc, label, x, y, { size })
    const baseline = y + lineHeight(size)
    line(doc, x + labelWidth, baseline, x + width, baseline)
}

/** Rasm bo'lsa chizadi; bo'lmasa jimgina o'tkazib yuboradi. */
async function drawOptionalImage(
    doc: jsPDF,
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    const data = await fetchBase64(url).catch(() => null)
    if (!data) return false
    doc.addImage(`data:image/png;base64,${data}`, "PNG", x, y, width, height)
    return true
}

/* ------------------------------------------------------------------ *
 * 1. Расходная накладная
 * ------------------------------------------------------------------ */

async function drawExpenseInvoice(doc: jsPDF, data: DemandData, box: Box) {
    let y = box.top + 8

    drawText(
        doc,
        `Расходная накладная № ${data.number} от ${ruDate(data.docDate)}`,
        box.left + box.width / 2,
        y,
        { size: 14, style: "bold", align: "center" },
    )
    y += lineHeight(14) + 6

    // Yorliqlar o'ng chetiga tekislangan — namunadagi kabi ustun hosil bo'ladi.
    const labelRight = box.left + 34
    const valueX = labelRight + 3
    const valueWidth = box.right - valueX
    const rows: [string, string][] = [
        ["Поставщик:", data.sellerPostal],
        ["Покупатель:", data.buyerDetails],
        ["Склад:", data.warehouseName],
    ]
    rows.forEach(([label, value]) => {
        if (!value) return
        drawText(doc, label, labelRight, y, {
            size: BODY,
            style: "bold",
            align: "right",
        })
        y +=
            drawText(doc, value, valueX, y, {
                size: BODY,
                style: "bold",
                maxWidth: valueWidth,
            }) + 1
    })

    y += 6

    // Namunadagi ustun tartibi: narx miqdordan oldin turadi.
    const columns: Column[] = [
        { title: "№ п.п.", width: 16 },
        { title: "Наименование", width: 76, align: "left" },
        { title: "Ед. изм.", width: 18 },
        { title: "Цена", width: 24, align: "right" },
        { title: "Кол-во", width: 20, align: "right" },
        { title: "Сумма", width: 26, align: "right" },
    ]
    y = drawTable(
        doc,
        box,
        y,
        columns,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            item.unit,
            money(item.price),
            amount(item.quantity),
            money(item.total),
        ]),
    )

    // «Итого» — faqat oxirgi ikki ustun ostida, chapdagi kataklarsiz.
    const totalsWidth = columns[4].width + columns[5].width
    const totalsX = box.left + totalWidth(columns) - totalsWidth
    const height = lineHeight(BODY) + PAD * 2
    rect(doc, totalsX, y, totalsWidth, height)
    line(
        doc,
        totalsX + columns[4].width,
        y,
        totalsX + columns[4].width,
        y + height,
    )
    drawText(doc, "Итого", totalsX + columns[4].width - PAD, y + PAD, {
        size: BODY,
        align: "right",
    })
    drawText(doc, money(data.total), totalsX + totalsWidth - PAD, y + PAD, {
        size: BODY,
        align: "right",
    })
    y += height + 6

    y += drawText(
        doc,
        `Всего наименований ${data.items.length}, на сумму ${money(data.total)} ${currencyName(data.currency)}`,
        box.left,
        y,
        { size: BODY },
    )
    y += drawText(doc, amountInWords(data.total, data.currency), box.left, y, {
        size: BODY,
    })

    y += 8
    line(doc, box.left, y, box.right, y)
    drawText(doc, "прописью", box.left + box.width / 2, y + 0.5, {
        size: TINY,
        align: "center",
    })

    y += 12
    drawFillIn(doc, box.left, y, "Отпустил", box.width / 2 - 6)
    drawFillIn(doc, box.left + box.width / 2, y, "Получил", box.width / 2)
}

/* ------------------------------------------------------------------ *
 * 2. ТТН (Узбекистан, новая) va 7. ttn_uz_union
 * ------------------------------------------------------------------ */

/** Ikkala yotiq ТТН uchun umumiy sarlavha va tomonlar bloki. */
function drawTtnHeader(
    doc: jsPDF,
    data: DemandData,
    box: Box,
    { withPoints }: { withPoints: boolean },
): number {
    let y = box.top + 4

    drawText(
        doc,
        `ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ №  ${data.number} от ${ruDate(data.docDate)} г.`,
        box.left + box.width / 2,
        y,
        { size: 13, style: "bold", align: "center" },
    )
    y += lineHeight(13) + 8

    y += drawText(doc, `Тип перевозки: ${data.transportType}`, box.left, y, {
        size: BODY,
        style: "bold",
    })
    y += 2
    drawText(doc, `Автомобиль: ${data.carModel}`, box.left, y, {
        size: BODY,
        style: "bold",
    })
    y +=
        drawText(doc, `гос.номер: ${data.carNumber}`, box.left + 74, y, {
            size: BODY,
            style: "bold",
        }) + 4

    const columnX = box.left + box.width / 2
    const left: [string, string][] = [
        ["Заказчик:", data.buyerName],
        ["ИНН:", data.buyerInn],
        ["Грузоотправитель:", data.sellerShortName],
        ["ИНН:", data.sellerInn],
    ]
    const right: [string, string][] = [
        ["Перевозчик:", data.carrier],
        ["Грузополучатель:", data.buyerName],
        ["ИНН:", data.buyerInn],
    ]
    if (withPoints) {
        left.push(
            ["Пункт погрузки 1:", data.loadingPoint],
            ["Пункт погрузки 2:", data.loadingPoint2],
            ["Переадресовка:", data.redirection],
        )
        right.push(
            ["Пункт разгрузки 1:", data.unloadingPoint],
            ["Пункт разгрузки 2:", data.unloadingPoint2],
            ["Адрес нового грузополучателя:", data.newConsigneeAddress],
        )
    } else {
        left.push(["Переадресовка:", data.redirection])
        right.push(["Адрес грузополучателя:", data.newConsigneeAddress])
    }

    const bottom = Math.max(
        drawLines(doc, box.left, y, left, { width: box.width / 2 - 6 }),
        drawLines(doc, columnX, y, right, { width: box.width / 2 - 6 }),
    )
    return bottom + 4
}

async function drawTtnUzNew(doc: jsPDF, data: DemandData, box: Box) {
    let y = drawTtnHeader(doc, data, box, { withPoints: true })

    const columns: Column[] = [
        { title: "№", width: 8 },
        { title: "Наименование работы (услуги)", width: 60, align: "left" },
        { title: "Ед. изм.", width: 16 },
        { title: "Кол-во", width: 18, align: "right" },
        { title: "Цена", width: 20, align: "right" },
        { title: "Общая стоимость груза", width: 26, align: "right" },
        { title: "Стоимость автоперевозки", width: 24, align: "right" },
        { title: "С грузом следуют документы", width: 24 },
        { title: "Способ опред. Массы", width: 20 },
        { title: "Класс груза", width: 18 },
        {
            title: "Масса, нт",
            width: 39,
            children: [
                { title: "брутто", width: 19.5, align: "right" },
                { title: "нетто", width: 19.5, align: "right" },
            ],
        },
    ]

    y = drawTable(
        doc,
        box,
        y,
        columns,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            item.unit,
            amount(item.quantity),
            money(item.price),
            money(item.total),
            "",
            index === 0 ? data.cargoDocuments : "",
            index === 0 ? data.weightMethod : "",
            index === 0 ? data.cargoClass : "",
            item.weightKg ? amount(item.weightKg / 1000) : "",
            item.weightKg ? amount(item.weightKg / 1000) : "",
        ]),
        { size: SMALL },
    )

    // «Всего» — summa o'z ustunida, to'ldirilmagan uchtasida krest.
    y += drawRow(
        doc,
        box,
        y,
        mergedFirst(leaves(columns)),
        ["Всего", "", "", "", money(data.total), "", "x", "x", "x", "", ""],
        { size: SMALL, style: "bold" },
    )

    y += 3
    y += drawText(
        doc,
        `Всего отпущено на сумму ${amountInWords(data.total, data.currency)}`,
        box.left,
        y,
        { size: BODY },
    )

    y += 4
    const columnX = box.left + box.width / 2
    drawText(doc, "Особые отметки:", box.left, y, { size: BODY })
    drawFillIn(doc, columnX, y, "Сдал вод./эксп.:", box.width / 2 - 20)
    y += lineHeight(BODY) + 5

    drawText(doc, `Сдал: ${data.executor}`, box.left, y, { size: BODY })
    drawText(doc, "Принял:", columnX, y, { size: BODY })
    y += lineHeight(BODY) + 5

    drawFillIn(doc, box.left, y, "Принял вод./эксп.:", box.width / 2 - 20)
    drawText(doc, "Расстояние перевозок:", columnX, y, { size: BODY })
}

async function drawTtnUzUnion(doc: jsPDF, data: DemandData, box: Box) {
    let y = drawTtnHeader(doc, data, box, { withPoints: false })

    const columns: Column[] = [
        { title: "№", width: 10 },
        { title: "Наименование работы (услуги)", width: 92, align: "center" },
        { title: "Ед. изм.", width: 22 },
        { title: "Кол-во", width: 22 },
        { title: "Цена", width: 34 },
        { title: "Общая стоимость груза", width: 93 },
    ]

    y = drawTable(
        doc,
        box,
        y,
        columns,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            item.unit,
            amount(item.quantity),
            formatNumber(item.price, {
                decimalScale: 4,
                fixedDecimalScale: true,
                isShowZero: true,
            }),
            money(item.total),
        ]),
    )

    // «Всего» — o'ng chetdagi ikki ustun ostida.
    const cols = leaves(columns)
    const width = cols[4].width + cols[5].width
    const x = box.left + totalWidth(columns) - width
    const height = lineHeight(BODY) + PAD * 2
    rect(doc, box.left, y, totalWidth(columns), height)
    line(doc, x, y, x, y + height)
    line(doc, x + cols[4].width, y, x + cols[4].width, y + height)
    drawText(doc, "Всего", x + cols[4].width - PAD, y + PAD, {
        size: BODY,
        style: "bold",
        align: "right",
    })
    drawText(
        doc,
        money(data.total),
        x + width / 2 + cols[4].width / 2,
        y + PAD,
        {
            size: BODY,
            style: "bold",
            align: "center",
        },
    )
    y += height + 6

    drawText(doc, "Всего отпущено на сумму", box.left, y, { size: BODY })
    y +=
        drawText(
            doc,
            amountInWords(data.total, data.currency),
            box.left + 74,
            y,
            { size: BODY },
        ) + 6

    const columnX = box.left + box.width / 2
    drawText(doc, `Сдал: ${data.executor}`, box.left, y, { size: BODY })
    drawText(doc, "Подпись", columnX, y, { size: BODY })
    await drawOptionalImage(doc, SIGNATURE_URL, columnX + 30, y - 8, 40, 16)

    y += 12
    drawText(doc, "Печать", box.left, y, { size: BODY })
    await drawOptionalImage(doc, STAMP_URL, box.left + 30, y - 10, 34, 34)
    drawText(doc, "Принял:", columnX, y, { size: BODY })
}

/* ------------------------------------------------------------------ *
 * 3. Типовая форма № 1-т
 * ------------------------------------------------------------------ */

async function drawTtn1T(doc: jsPDF, data: DemandData, box: Box) {
    let y = box.top

    // Yuqori chap burchak — nusxalar ro'yxati va «Коды» katagi.
    const copies = [
        "1-й экз. - грузоотправителю",
        "2-й экз. - грузополучателю",
        "3-й и 4-й экз.  перевозчику",
    ]
    copies.forEach((text, i) => {
        drawText(doc, text, box.left, y + 6 + i * lineHeight(SMALL), {
            size: SMALL,
        })
    })

    const codesX = box.left + 62
    drawText(doc, "Коды", codesX - 2, y + 1, { size: SMALL, align: "right" })
    const cell = 8.5
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 6; col++) {
            rect(doc, codesX + col * cell, y + 1 + row * cell, cell, cell)
        }
    }

    drawText(doc, "Типовая форма № 1-т", box.right, y, {
        size: BODY,
        style: "bold",
        align: "right",
    })
    drawText(
        doc,
        `ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ № ${data.number}`,
        box.left + 130,
        y + 9,
        { size: 11, style: "bold" },
    )

    // O'ng chetdagi kod kataklari ustuni — «Типовая форма № 1-т» yozuvi
    // ostidan boshlanadi, aks holda ular bir-birining ustiga tushadi.
    const codeBoxX = box.right - 30
    for (let i = 0; i < 5; i++) {
        rect(doc, codeBoxX, y + 6 + i * 9, 30, 9)
    }

    y += 30

    drawText(doc, `${ruDate(data.docDate)} г.`, box.left + 28, y, {
        size: BODY,
    })
    drawText(doc, `Водитель: ${data.driver}`, box.left + 118, y, { size: BODY })
    y += lineHeight(BODY) + 4

    // Uch ustun: chapda avtomobil, o'rtada tomonlar, o'ngda «код» kataklari.
    const midX = box.left + 118
    const left: [string, string][] = [
        ["К путевому листу:", data.waybillNumber],
        ["Перевозчик:", data.carrier],
        ["Автомобиль:", data.carModel],
        ["Номер автомобиля:", data.carNumber],
        ["Пункт погрузки:", data.loadingPoint],
    ]
    const middle: [string, string][] = [
        ["По договору:", data.contractLine],
        ["Заказчик (плательщик) УЗ:", data.buyerName],
        [
            "Грузоотправитель:",
            `${data.sellerShortName}  ИНН: ${data.sellerInn}`,
        ],
        ["Грузополучатель:", `${data.buyerName}  ИНН: ${data.buyerInn}`],
        ["Пункт разгрузки:", data.unloadingPoint],
    ]

    const step = lineHeight(BODY) + 5
    left.forEach(([label, value], i) => {
        drawText(doc, `${label} ${value}`.trim(), box.left, y + i * step, {
            size: BODY,
            maxWidth: 112,
        })
    })
    middle.forEach(([label, value], i) => {
        drawText(doc, `${label} ${value}`.trim(), midX, y + i * step, {
            size: BODY,
            maxWidth: box.right - midX - 34,
        })
        drawText(doc, "код", box.right - 32, y + i * step, {
            size: SMALL,
            align: "right",
        })
        rect(doc, box.right - 30, y + i * step - 1.5, 30, step - 1)
    })
    y += step * Math.max(left.length, middle.length) + 4

    const columns: Column[] = [
        { title: "№", width: 8 },
        {
            title: "Наименование\nгруза или номера\nконтейнеров",
            width: 46,
            align: "center",
        },
        { title: "Ед. изм.", width: 16 },
        { title: "Кол-во", width: 17, align: "right" },
        { title: "Цена", width: 18, align: "right" },
        { title: "Сумма", width: 20, align: "right" },
        { title: "С грузом следуют документы", width: 24 },
        { title: "Вид упаковки", width: 18 },
        { title: "Количество мест", width: 20 },
        { title: "Способ определения массы", width: 22 },
        { title: "Код груза", width: 16 },
        { title: "Класс груза", width: 16 },
        { title: "Масса брутто, тонны", width: 22, align: "right" },
    ]

    const quantityTotal = data.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
    )
    y = drawTable(
        doc,
        box,
        y,
        columns,
        data.items.map((item, index) => [
            String(index + 1),
            item.name,
            item.unit,
            amount(item.quantity),
            money(item.price),
            money(item.total),
            index === 0 ? data.cargoDocuments : "",
            index === 0 ? data.packageKind : "",
            index === 0 ? data.placesCount : "",
            index === 0 ? data.weightMethod : "",
            "",
            index === 0 ? data.cargoClass : "",
            item.weightKg ? amount(item.weightKg / 1000) : "",
        ]),
        { size: SMALL },
    )

    y += drawRow(
        doc,
        box,
        y,
        mergedFirst(leaves(columns)),
        [
            "Итого",
            "",
            amount(quantityTotal),
            "",
            money(data.total),
            "",
            "",
            "",
            "Кол-во ездок",
            "",
            "",
            "",
        ],
        { size: SMALL, style: "bold" },
    )

    y += 3
    drawText(doc, "Всего отпущено на сумму", box.left, y, { size: BODY })
    drawText(doc, amountInWords(data.total, data.currency), box.left + 46, y, {
        size: BODY,
    })

    // O'ng tomonda — kim ruxsat berdi va kim berdi.
    const signX = box.left + 168
    drawText(doc, "Отпуск разрешил:", signX - 2, y, {
        size: BODY,
        align: "right",
    })
    drawText(doc, data.releaseAllowedBy, signX, y, { size: BODY })
    line(doc, signX, y + 4.5, signX + 60, y + 4.5)
    line(doc, signX + 68, y + 4.5, box.right, y + 4.5)
    drawText(doc, "должность", signX + 30, y + 5, {
        size: TINY,
        align: "center",
    })
    drawText(doc, "подпись", signX + 90, y + 5, { size: TINY, align: "center" })

    y += 10
    drawText(doc, "Отпуск произвел:", signX - 2, y, {
        size: BODY,
        align: "right",
    })
    drawText(doc, data.executor, signX, y, { size: BODY })
    line(doc, signX, y + 4.5, signX + 60, y + 4.5)
    line(doc, signX + 68, y + 4.5, box.right, y + 4.5)
    drawText(doc, "должность", signX + 30, y + 5, {
        size: TINY,
        align: "center",
    })
    drawText(doc, "подпись", signX + 90, y + 5, { size: TINY, align: "center" })

    /*
     * Qo'lda to'ldiriladigan pastki qism — uchta ustun.
     *
     * Bu yerda shrift asosiy matndan mayda: qatorlar «yozuv — chiziq — yozuv»
     * dan iborat va odatdagi kegl bilan qo'shni ustunga chiqib ketardi
     * («к перевозке» «массой брутто» ustiga minib qolgandi).
     */
    y += 8
    const colX = [box.left, box.left + 64, signX]
    const colW = 60
    const F = SMALL

    drawText(doc, "Указанный груз за испр.", colX[0], y, { size: F })
    drawText(doc, "кол.", colX[0] + 40, y, { size: F })
    drawText(doc, "Указанный груз за испр.", colX[1], y, { size: F })
    drawText(doc, "кол.", colX[1] + 40, y, { size: F })
    drawText(doc, "По доверенности №", colX[2], y, { size: F })
    line(doc, colX[2] + 28, y + 4, box.right, y + 4)
    y += lineHeight(F) + 4
    ;[0, 1].forEach((i) => {
        drawText(doc, "Пломбой, тарой и упаковкой", colX[i], y, { size: F })
        line(doc, colX[i] + 41, y + 3.5, colX[i] + 47, y + 3.5)
        drawText(doc, "мест", colX[i] + 48, y, { size: F })
        line(doc, colX[i] + 55, y + 3.5, colX[i] + colW, y + 3.5)
        drawText(doc, "оттиск", colX[i] + 44, y + 4.5, {
            size: TINY,
            align: "center",
        })
        drawText(doc, "прописью", colX[i] + 57, y + 4.5, {
            size: TINY,
            align: "center",
        })
    })
    drawText(doc, "выданной", colX[2], y, { size: F })
    line(doc, colX[2] + 15, y + 4, box.right, y + 4)
    y += lineHeight(F) + 6
    ;[0, 1].forEach((i) => {
        drawText(doc, "массой брутто, т", colX[i], y, { size: F })
        line(doc, colX[i] + 25, y + 3.5, colX[i] + 43, y + 3.5)
        drawText(doc, i === 0 ? "к перевозке" : "сдал", colX[i] + 44, y, {
            size: F,
        })
        drawText(doc, "прописью", colX[i] + 34, y + 4.5, {
            size: TINY,
            align: "center",
        })
    })
    drawText(doc, "груз получил", colX[2], y, { size: F })
    line(doc, colX[2] + 21, y + 4, box.right, y + 4)
    y += lineHeight(F) + 6

    drawText(doc, "сдал", colX[0], y, { size: F })
    line(doc, colX[0] + 8, y + 3.5, colX[0] + colW, y + 3.5)
    drawText(
        doc,
        "должность,  Ф. И. О.,  подпись,  штамп",
        colX[0] + 32,
        y + 4.5,
        {
            size: TINY,
            align: "center",
        },
    )
    drawText(doc, "водитель-экспедитор", colX[1], y, { size: F })
    line(doc, colX[1] + 30, y + 3.5, colX[1] + colW, y + 3.5)
    drawText(doc, "подпись", colX[1] + 45, y + 4.5, {
        size: TINY,
        align: "center",
    })
    y += lineHeight(F) + 6

    drawText(doc, "Принял водитель-экспедитор", colX[0], y, { size: F })
    line(doc, colX[0] + 42, y + 3.5, colX[0] + colW, y + 3.5)
    drawText(doc, "Ф. И. О.,  подпись,", colX[0] + 51, y + 4.5, {
        size: TINY,
        align: "center",
    })
    drawText(doc, "Принял", colX[1], y, { size: F })
    line(doc, colX[1] + 12, y + 3.5, colX[1] + colW, y + 3.5)
    drawText(
        doc,
        "должность,  Ф. И. О.,  подпись,  штамп",
        colX[1] + 36,
        y + 4.5,
        {
            size: TINY,
            align: "center",
        },
    )
    line(doc, colX[2], y + 3.5, box.right, y + 3.5)
    drawText(doc, "подпись грузополучателя", colX[2] + 36, y + 4.5, {
        size: TINY,
        align: "center",
    })
}

/* ------------------------------------------------------------------ *
 * 4–6. Firma blankidagi ТТН
 * ------------------------------------------------------------------ */

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
    label?: string
    value?: string
    inline?: boolean
    labelWidth?: number
}

const LABEL_W = 34

function cellHeight(doc: jsPDF, cell: Cell, width: number): number {
    const inner = width - PAD * 2
    const labelW = cell.labelWidth ?? LABEL_W
    if (cell.inline) {
        return (
            Math.max(
                textHeight(doc, cell.value ?? "", {
                    size: BODY,
                    maxWidth: inner - (cell.label ? labelW : 0),
                }),
                cell.label ? lineHeight(BODY) : 0,
            ) +
            PAD * 2
        )
    }
    return (
        (cell.label ? lineHeight(BODY) : 0) +
        (cell.value ?
            textHeight(doc, cell.value, { size: BODY, maxWidth: inner })
        :   0) +
        PAD * 2
    )
}

function drawInfoRow(doc: jsPDF, box: Box, y: number, cells: Cell[]): number {
    const width = box.width / cells.length
    const height = Math.max(
        ...cells.map((cell) => cellHeight(doc, cell, width)),
        lineHeight(BODY) + PAD * 2,
    )

    cells.forEach((cell, i) => {
        const x = box.left + width * i
        rect(doc, x, y, width, height)
        const inner = width - PAD * 2
        const labelW = cell.labelWidth ?? LABEL_W
        if (cell.inline) {
            if (cell.label) {
                drawText(doc, cell.label, x + PAD, y + PAD, {
                    size: BODY,
                    style: "bold",
                })
            }
            drawText(
                doc,
                cell.value ?? "",
                x + PAD + (cell.label ? labelW : 0),
                y + PAD,
                { size: BODY, maxWidth: inner - (cell.label ? labelW : 0) },
            )
            return
        }
        let cursor = y + PAD
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
    })

    return height
}

async function drawTtnLetterhead(
    doc: jsPDF,
    data: DemandData,
    box: Box,
    { weightColumn }: { weightColumn: boolean },
) {
    let y = box.top
    const half = box.width / 2

    const logo = await fetchBase64(LOGO_URL).catch(() => null)
    if (logo) {
        doc.addImage(
            `data:image/png;base64,${logo}`,
            "PNG",
            box.left,
            y,
            LOGO_WIDTH,
            LOGO_HEIGHT,
        )
    }

    const headerRows: [string, string][] = [
        ["ТТН №:", data.number],
        [
            "КОНТРАКТ №, Лот №:",
            data.contractNumber || data.lotNumber ?
                `${data.contractNumber} / ${data.lotNumber}`.trim()
            :   "",
        ],
        [
            "ПРИЛОЖЕНИЕ №:",
            [
                data.appendixNumber,
                data.appendixVersion && `V${data.appendixVersion}`,
                data.appendixDate && `от ${ruDate(data.appendixDate)}`,
            ]
                .filter(Boolean)
                .join(" "),
        ],
    ]
    let cursor = y
    headerRows.forEach(([label, value]) => {
        drawText(doc, label, box.left + 100, cursor, {
            size: BODY,
            style: "bold",
        })
        cursor += Math.max(
            drawText(doc, value, box.right, cursor, {
                size: BODY,
                align: "right",
                maxWidth: box.width - 102,
            }),
            lineHeight(BODY),
        )
    })
    y = Math.max(y + LOGO_HEIGHT, cursor) + 8

    y += drawInfoRow(doc, box, y, [
        { label: "Покупатель:", value: data.buyerName, inline: true },
    ])
    y += drawInfoRow(doc, box, y, [
        {
            label: "Дата отгрузки",
            value: ruDate(data.docDate),
            inline: true,
        },
        { label: "Условие поставки:", value: data.deliveryTerms, inline: true },
    ])
    y += drawInfoRow(doc, box, y, [
        { label: "Поставщик:", value: data.seller },
        { label: "Грузополучатель:", value: data.consignee },
    ])
    y += drawInfoRow(doc, box, y, [
        {
            label: "Производитель:",
            value: data.manufacturer,
            inline: true,
            labelWidth: 26,
        },
        { label: "Направление:", value: data.direction, inline: true },
    ])
    y += drawInfoRow(doc, box, y, [
        {
            label: "Описание товара:",
            value: data.goodsDescription,
            inline: true,
        },
    ])

    /* ---- Texnik xususiyatlar ---- */
    y += 4
    const specColumns = [
        parseSpecs(data.specsLeft),
        parseSpecs(data.specsRight),
    ]
    const specTop = y
    specColumns.forEach((rows, columnIndex) => {
        const x = box.left + half * columnIndex
        let specY = specTop
        specY += drawText(doc, "Технические характеристики:", x, specY, {
            size: BODY,
            style: "bold",
        })
        rows.forEach((row) => {
            drawText(doc, row.label, x, specY, { size: BODY, style: "bold" })
            specY += drawText(doc, row.value, x + 52, specY, {
                size: BODY,
                style: "bold",
                maxWidth: half - 54,
            })
        })
    })
    y =
        specTop +
        Math.max(
            ...specColumns.map((rows) => (rows.length + 1) * lineHeight(BODY)),
        ) +
        6

    /* ---- Tovarlar ---- */
    const columns: Column[] =
        weightColumn ?
            [
                { title: "№", width: 10 },
                {
                    title: "Наименование и Типоразмер",
                    width: 82,
                    align: "left",
                },
                { title: "Ед. изм", width: 20 },
                { title: "Количество", width: 30, align: "right" },
                { title: "Вес (кг)", width: 30, align: "right" },
            ]
        :   [
                { title: "№", width: 10 },
                {
                    title: "Наименование и Типоразмер",
                    width: 102,
                    align: "left",
                },
                { title: "Ед.изм.", width: 24 },
                { title: "Количество", width: 36, align: "right" },
            ]

    y = drawTable(
        doc,
        box,
        y,
        columns,
        data.items.map((item, index) => {
            const row = [
                String(index + 1),
                item.name,
                item.unit,
                amount(item.quantity),
            ]
            if (weightColumn)
                row.push(item.weightKg ? amount(item.weightKg) : "")
            return row
        }),
        { headerSize: BODY },
    )

    // «Итого» — jami miqdor, o'ng chetda.
    const quantityTotal = data.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
    )
    const height = lineHeight(BODY) + PAD * 2
    line(doc, box.left, y + height, box.right, y + height, 0.5)
    drawText(doc, "Итого", box.left, y + PAD, { size: BODY, style: "bold" })
    drawText(
        doc,
        money(quantityTotal),
        box.left + totalWidth(columns) - PAD,
        y + PAD,
        { size: BODY, style: "bold", align: "right" },
    )
    y += height + 4

    /* ---- Pastki rekvizitlar ---- */
    drawText(doc, "Упаковка", box.left, y, { size: BODY, style: "bold" })
    drawText(doc, data.packaging, box.left + half - 4, y + 1.5, {
        size: BODY,
        align: "right",
    })
    drawText(doc, "Маркировка", box.left + half, y, {
        size: BODY,
        style: "bold",
    })
    drawText(doc, data.marking, box.right, y + 1.5, {
        size: BODY,
        align: "right",
    })
    y += lineHeight(BODY) + 3

    drawText(doc, "Перевозчик", box.left, y, { size: BODY, style: "bold" })
    drawText(doc, data.carrier, box.left + half - 4, y, {
        size: BODY,
        align: "right",
    })
    drawText(doc, "Транспортное средство", box.left + half, y, {
        size: BODY,
        style: "bold",
    })
    drawText(
        doc,
        [data.carModel, data.carNumber].filter(Boolean).join(", ") || ",",
        box.right,
        y,
        { size: BODY, align: "right" },
    )
    y += lineHeight(BODY) + 1
    line(doc, box.left, y, box.right, y)
    y += 1
    drawText(doc, "конец страницы", box.left, y, { size: SMALL })

    /* ---- Imzolar ---- */
    y += 16
    const sign = (label: string, x: number) => {
        drawText(doc, label, x, y, { size: 11, style: "bold" })
        line(doc, x + 46, y + 4.5, x + 60, y + 4.5)
    }
    sign("РУКОВОДИТЕЛЬ", box.left)
    sign("ПОКУПАТЕЛЬ", box.left + half)
    y += 10
    sign("ТОВАР ОТПУСТИЛ", box.left)
    drawText(doc, "М.П.", box.left + 66, y + 1, { size: TINY, style: "bold" })
    sign("ПЕРЕВОЗЧИК", box.left + half)
    drawText(doc, "М.П.", box.left + half + 66, y + 1, {
        size: TINY,
        style: "bold",
    })
}

/* ------------------------------------------------------------------ */

export async function buildDemandPdf(data: DemandData): Promise<jsPDF> {
    const meta = DEMAND_VARIANTS[data.variant] ?? DEMAND_VARIANTS.expenseInvoice
    const doc = await createDocument(meta.landscape ? "landscape" : "portrait")
    const box = geometry(meta.landscape)

    switch (meta.layout) {
        case "expenseInvoice":
            await drawExpenseInvoice(doc, data, box)
            break
        case "ttnUzNew":
            await drawTtnUzNew(doc, data, box)
            break
        case "ttn1T":
            await drawTtn1T(doc, data, box)
            break
        case "ttnUzUnion":
            await drawTtnUzUnion(doc, data, box)
            break
        default:
            await drawTtnLetterhead(doc, data, box, {
                weightColumn: !!meta.weightColumn,
            })
    }

    stampPageNumbers(doc, meta.landscape)
    return doc
}
