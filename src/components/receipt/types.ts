// Receipt data for general payments, cash sales, etc.
export interface ReceiptData {
    receiptNo?: string
    transaction?: string
    date?: string
    saleType?: string
    saleCode?: string
    clientName?: string
    paymentPurpose?: string
    branchName?: string
    cashier?: string
    amount: number
    currency?: "uzs" | "usd"
    qrValue?: string
    shopName?: string
    header?: string
}

// Manufacture label data (preserving exact backend structure)
export interface ManufactureLabelData {
    zadanieNo: number
    razmerShirina?: number | null
    partiyaRulon?: string
    vagonNo?: string
    plavka?: string
    vesShripsa: number
    dataRezki: string
    gotovayaProduktsiya: string
    markaStali: string
    tolshchina?: number | null
}

// Rolling/Prokatka label data
export interface RollingLabelData {
    packNumber: string
    tubeSize: string // e.g. "76x3.5"
    batchNumber: string
    length: number // in mm
    weightTn: number
    quantity: number
    steelGrade: string // Marka stali
    standard: string // e.g. "ГОСТ 10704-91"
    productionDate: string
    master: string
    smena: string
}

export type PrintLanguage = "escpos" | "tspl"
