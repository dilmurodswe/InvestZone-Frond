/**
 * Prokatka yorlig'i (INVEST ZONE birka) o'lchamlari va o'zgarmas matnlari.
 * Qog'oz oldindan bosilgan (logo/ramka/STZ tayyor) — biz faqat ma'lumotni
 * bo'sh joyga to'g'ri joylashtiramiz.
 *
 * Fizik birka: 80mm (eni) × 130mm (bo'yi), portret.
 */

// Yorliq o'lchami (mm)
export const LABEL_WIDTH_MM = 80
export const LABEL_HEIGHT_MM = 130

/**
 * Kalibrovka — matn blokini oldindan bosilgan qog'ozga moslash uchun.
 * Agar chop etilganda ma'lumot yuqori/pastga/yon tomonga siljigan bo'lsa,
 * shu qiymatlarni o'zgartiring (mm) va qayta chop eting.
 *
 *  - HEADER_RESERVED_MM: yuqoridagi oldindan bosilgan logo/shapka egallagan joy.
 *  - LEFT_PADDING_MM / RIGHT_PADDING_MM: chap/o'ng ramkadan ichkariga chekinish.
 *      Termal printer 80mm qog'ozning chetlariga to'liq bosolmaydi (~3-4mm
 *      "o'lik zona" bor). Shu sabab o'ng tomondagi qiymatlar KESILMASLIGI uchun
 *      RIGHT_PADDING_MM kattaroq qilingan. Qiymatlar hali ham kesilsa — oshiring.
 *  - FOOTER_RESERVED_MM: pastdagi STZ logotipi uchun qoldiriladigan joy.
 *  - OFFSET_X_MM: butun ma'lumot blokini yon tomonga surish.
 *      Musbat = O'NGGA, manfiy = CHAPGA. Chapda katta bo'sh joy qolsa manfiy bering.
 *  - OFFSET_Y_MM: butun blokni yuqori/pastga surish. Musbat = PASTGA.
 */
export const HEADER_RESERVED_MM = 30
export const LEFT_PADDING_MM = 6
export const RIGHT_PADDING_MM = 12
export const FOOTER_RESERVED_MM = 4
export const OFFSET_X_MM = 0
export const OFFSET_Y_MM = 0

// Pastdagi o'zgarmas sertifikat matnlari (birka pastida chop etiladi)
export const LABEL_CERTIFICATIONS = [
    "ISO 9001:2015-000351/A/176-12-25",
    "UZTR.319-004:2015",
] as const
