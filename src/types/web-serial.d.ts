/**
 * Type definitions for Web Serial API
 */

interface SerialPort {
    open(options: {
        baudRate: number
        dataBits?: number
        stopBits?: number
        parity?: "none" | "even" | "odd"
    }): Promise<void>
    close(): Promise<void>
    readonly readable: ReadableStream<Uint8Array> | null
    readonly writable: WritableStream<Uint8Array> | null
}

interface SerialPortRequestOptions {
    filters?: {
        usbVendorId?: number
        usbProductId?: number
    }[]
}

interface Serial extends EventTarget {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
    getPorts(): Promise<SerialPort[]>
}

interface Navigator {
    readonly serial: Serial
}
