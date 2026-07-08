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
    planNumber: string // Plan № → ПАРТИЯ №
    tubeSize: string // Наружный размер x Толщина, e.g. "60x60x2.5"
    batchNumber: string
    length: number // ДЛИНА (plan zadaniya) — millimetrlarda
    totalLength?: number // ОБЩАЯ ДЛИНА (plan-fakt) — metrlarda
    steelGrade: string // Marka stali → МАРКА СТАЛИ
    standard: string // СТАНДАРТ НТД, e.g. "ГОСТ 8639-82"
    specification?: string // SPECIFICATION, ikkinchi standart, e.g. "ГОСТ 13663-86"
    productionDate: string // ДАТА — print sanasi
    master: string
    smena: string
    packs: RollingPackData[] // Har biri alohida yorliq
}

export type PrintLanguage = "escpos" | "tspl"
