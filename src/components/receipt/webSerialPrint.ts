/**
 * Web Serial API fallback for printing
 * Used when QZ Tray is not available and printer is connected via COM port
 */

import { buildEscposFromCanvas } from "./escpos"

let port: SerialPort | null = null

/**
 * Check if Web Serial API is available
 */
export function isWebSerialAvailable(): boolean {
    return "serial" in navigator
}

/**
 * Request serial port access and connect
 */
export async function connectSerialPort(): Promise<void> {
    if (!isWebSerialAvailable()) {
        throw new Error("Web Serial API moslanmagan (faqat Chrome/Edge)")
    }

    // Request port from user
    port = await navigator.serial.requestPort()

    // Open port (common settings for thermal printers)
    await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
    })
}

/**
 * Print canvas via serial port
 */
export async function printCanvasSerial(
    canvas: HTMLCanvasElement,
): Promise<void> {
    if (!port) {
        throw new Error("Serial port ulanmagan. Avval ulang.")
    }

    const escposData = buildEscposFromCanvas(canvas)

    const writer = port.writable?.getWriter()
    if (!writer) {
        throw new Error("Serial port yozish uchun tayyor emas")
    }

    try {
        await writer.write(escposData)
    } finally {
        writer.releaseLock()
    }
}

/**
 * Disconnect serial port
 */
export async function disconnectSerialPort(): Promise<void> {
    if (port) {
        await port.close()
        port = null
    }
}

/**
 * Check if currently connected
 */
export function isSerialConnected(): boolean {
    return port !== null
}
