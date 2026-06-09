/**
 * QZ Tray printing interface
 * Handles connection, printer selection, and raw printing via WebSocket
 */

import qz from "qz-tray"
import { buildEscposFromCanvas } from "./escpos"
import { getCertificate, signRequest } from "./qzSign"
import { buildTsplFromCanvas } from "./tspl"
import type { PrintLanguage } from "./types"

const PRINTER_STORAGE_KEY = "receiptPrinter"
const LANG_STORAGE_KEY = "receiptLang"

/**
 * Connect to QZ Tray (auto-signs requests)
 */
export async function connectQZ(): Promise<void> {
    if (qz.websocket.isActive()) return

    // Set security for signed requests
    qz.security.setCertificatePromise(() => Promise.resolve(getCertificate()))
    qz.security.setSignatureAlgorithm("SHA512")
    qz.security.setSignaturePromise((requestString: string) =>
        signRequest(requestString),
    )

    await qz.websocket.connect()
}

/**
 * Disconnect from QZ Tray
 */
export async function disconnectQZ(): Promise<void> {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect()
    }
}

/**
 * Get list of available printers
 */
export async function getPrinters(): Promise<string[]> {
    await connectQZ()
    return qz.printers.find()
}

/**
 * Get saved printer name from localStorage
 */
export function getSavedPrinter(): string | null {
    return localStorage.getItem(PRINTER_STORAGE_KEY)
}

/**
 * Save printer name to localStorage
 */
export function savePrinter(printerName: string): void {
    localStorage.setItem(PRINTER_STORAGE_KEY, printerName)
}

/**
 * Get saved printer language (escpos or tspl)
 */
export function getSavedLang(): PrintLanguage {
    const lang = localStorage.getItem(LANG_STORAGE_KEY)
    return (lang === "tspl" ? "tspl" : "escpos") as PrintLanguage
}

/**
 * Save printer language
 */
export function saveLang(lang: PrintLanguage): void {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
}

/**
 * Print canvas to thermal printer
 */
export async function printCanvas(canvas: HTMLCanvasElement): Promise<void> {
    await connectQZ()

    const printerName = getSavedPrinter()
    if (!printerName) {
        throw new Error("Printer topilmadi. Avval printerni tanlang.")
    }

    const lang = getSavedLang()

    let data: Uint8Array

    if (lang === "tspl") {
        const { commands } = buildTsplFromCanvas(canvas)
        data = commands
    } else {
        data = buildEscposFromCanvas(canvas)
    }

    // Convert Uint8Array to base64 for QZ Tray
    const base64Data = btoa(String.fromCharCode(...data))

    const config = qz.configs.create(printerName, {
        encoding: "base64",
    })

    await qz.print(config, [
        {
            type: "raw",
            format: "base64",
            data: base64Data,
        },
    ])
}

/**
 * Check if QZ Tray is available
 */
export async function isQZAvailable(): Promise<boolean> {
    try {
        await connectQZ()
        return true
    } catch {
        return false
    }
}
