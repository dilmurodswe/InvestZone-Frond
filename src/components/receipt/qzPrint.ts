// QZ Tray orqali chop etish. QZ Tray — kompyuterda ishlaydigan kichik dastur;
// u Windows'dagi printerga to'g'ridan-to'g'ri raw TSPL/ESC-POS yuboradi (drayver
// rasterizatsiyasini aylanib o'tib). USB label printer (XP-365B) uchun eng ishonchli yo'l.

import qz from "qz-tray"
import { buildEscposFromCanvas } from "./escpos"
import { getCertificate, signData } from "./qzSign"
import { buildTsplFromCanvas, uint8ToBase64 } from "./tspl"

const PRINTER_KEY = "receiptPrinter"
const LANG_KEY = "receiptLang"

export type ReceiptLang = "tspl" | "escpos"

export const getSavedLang = (): ReceiptLang => {
    try {
        return (localStorage.getItem(LANG_KEY) as ReceiptLang) || "escpos"
    } catch {
        return "escpos"
    }
}

export const setSavedLang = (lang: ReceiptLang) => {
    try {
        localStorage.setItem(LANG_KEY, lang)
    } catch {
        /* ignore */
    }
}

let configured = false
const configure = () => {
    if (configured) return
    // Imzolangan rejim — sertifikat QZ Tray'da `override.crt` bo'lsa, "Allow" oynasi chiqmaydi.
    qz.security.setCertificatePromise((resolve: (cert: string) => void) =>
        resolve(getCertificate()),
    )
    qz.security.setSignatureAlgorithm("SHA512")
    qz.security.setSignaturePromise(
        (toSign: string) =>
            (resolve: (sig: string) => void, reject: (err: unknown) => void) =>
                signData(toSign).then(resolve).catch(reject),
    )
    configured = true
}

export const isQzAvailable = (): boolean => {
    try {
        return typeof qz?.websocket?.connect === "function"
    } catch {
        return false
    }
}

export const connectQz = async (): Promise<void> => {
    configure()
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
    }
}

export const getSavedPrinter = (): string => {
    try {
        return localStorage.getItem(PRINTER_KEY) || ""
    } catch {
        return ""
    }
}

export const setSavedPrinter = (name: string) => {
    try {
        localStorage.setItem(PRINTER_KEY, name)
    } catch {
        /* ignore */
    }
}

/** QZ'dan barcha printerlar ro'yxatini oladi. */
export const listQzPrinters = async (): Promise<string[]> => {
    await connectQz()
    const found = await qz.printers.find()

    return Array.isArray(found) ? found : [found].filter(Boolean)
}

/** QZ'dagi printerlar ro'yxatidan termal/label printerni topadi (365 ustuvor). */
const pickPrinter = (printers: string[]): string | undefined => {
    if (!printers.length) return undefined
    const match =
        printers.find((p) => /365/i.test(p)) ||
        printers.find((p) =>
            /xprinter|pos[\s-]?80|thermal|receipt|tsc/i.test(p),
        )

    return match || printers[0]
}

/** QZ'ga ulanib, printerni topadi va saqlaydi (sozlash tugmasi uchun). */
export const setupQzPrinter = async (): Promise<string> => {
    await connectQz()
    const found = await qz.printers.find()
    const list: string[] =
        Array.isArray(found) ? found : [found].filter(Boolean)
    const chosen = pickPrinter(list)
    if (!chosen) throw new Error("Printer topilmadi")
    setSavedPrinter(chosen)

    return chosen
}

const getConfig = async () => {
    await connectQz()
    let printer = getSavedPrinter()
    if (!printer) {
        printer = await setupQzPrinter()
    }

    return qz.configs.create(printer)
}

/** Canvas chekni QZ Tray orqali, tanlangan tilda (TSPL/ESC-POS) chop etadi. */
export const printCanvasViaQz = async (
    canvas: HTMLCanvasElement,
    widthMm = 72,
): Promise<void> => {
    const config = await getConfig()
    const lang = getSavedLang()
    const bytes =
        lang === "escpos" ?
            buildEscposFromCanvas(canvas)
        :   buildTsplFromCanvas(canvas, widthMm)

    await qz.print(config, [
        {
            type: "raw",
            format: "command",
            flavor: "base64",
            data: uint8ToBase64(bytes),
        },
    ])
}

/** Diagnostika: oddiy matnli test (plain). Qaysi til o'qiladigan chiqarsa — printer tili o'sha. */
export const testPrintViaQz = async (lang: ReceiptLang): Promise<void> => {
    const config = await getConfig()
    const text =
        lang === "escpos" ?
            "\x1B\x40SMARTLIFE\nESC/POS TEST 123456\n\n\n"
        :   'SIZE 72 mm,40 mm\r\nGAP 0 mm,0 mm\r\nDIRECTION 1\r\nCLS\r\nTEXT 20,20,"3",0,1,1,"TSPL TEST 123456"\r\nPRINT 1,1\r\n'

    await qz.print(config, [
        { type: "raw", format: "command", flavor: "plain", data: text },
    ])
}
