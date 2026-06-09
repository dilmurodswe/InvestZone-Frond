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

// Rolling/Prokatka label data - single pack (old format, kept for compatibility)
export interface RollingPackData {
    packNumber: string
    weightTn: number
    quantity: number
}

// Rolling/Prokatka label data - plan with multiple packs
export interface RollingLabelData {
    planNumber: string // Plan №
    tubeSize: string // e.g. "76x3.5"
    batchNumber: string
    length: number // in mm
    steelGrade: string // Marka stali
    standard: string // e.g. "ГОСТ 10704-91"
    productionDate: string
    master: string
    smena: string
    packs: RollingPackData[] // Multiple packs
}

export type PrintLanguage = "escpos" | "tspl"
