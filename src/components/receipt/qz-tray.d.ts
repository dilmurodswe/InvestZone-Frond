/**
 * Type definitions for qz-tray
 */

declare module "qz-tray" {
    export interface QZConfig {
        setPrinter(printerName: string): void
        setEncoding(encoding: string): void
    }

    export interface PrintData {
        type: string
        format: string
        data: string
    }

    export const websocket: {
        connect(): Promise<void>
        disconnect(): Promise<void>
        isActive(): boolean
    }

    export const security: {
        setCertificatePromise(fn: () => Promise<string>): void
        setSignatureAlgorithm(algorithm: string): void
        setSignaturePromise(
            fn: (requestString: string) => Promise<string>,
        ): void
    }

    export const printers: {
        find(): Promise<string[]>
        getDefault(): Promise<string>
    }

    export const configs: {
        create(printerName: string, options?: { encoding?: string }): QZConfig
    }

    export function print(config: QZConfig, data: PrintData[]): Promise<void>

    const qz: {
        websocket: typeof websocket
        security: typeof security
        printers: typeof printers
        configs: typeof configs
        print: typeof print
    }

    export default qz
}
