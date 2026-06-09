# Chek (Receipt) chop etish — ESC/POS + QZ Tray

Bu modul shartnoma to'lovi, naqd savdo va kassa amallarida **termal printerga chek** chop etadi.
Printer **XP-365B** (USB termal printer), chop etish tili — **ESC/POS**.

Brauzer drayverdan o'tib grafik chop etganda printer "ahlat" belgilar chiqaradi. Shuning uchun
biz chekni brauzerda **rasmga (canvas)** chizamiz, so'ng uni **ESC/POS raster** buyrug'iga aylantirib,
**QZ Tray** orqali to'g'ridan-to'g'ri printerga yuboramiz (drayverni butunlay aylanib o'tib).
Shu sabab kirill matn va QR ham aniq bosiladi (shrift/codepage muammosi yo'q).

---

## Ish prinsipi (oqim)

```
ReceiptData  ->  renderReceiptCanvas()  ->  <canvas> (576 nuqta = 72mm, monoxrom)
             ->  buildEscposFromCanvas()  ->  ESC/POS raster (GS v 0, band-band)
             ->  QZ Tray (imzolangan, raw base64)  ->  XP-365B printer
```

- Chek **rasm** sifatida yuboriladi — printer faqat nuqtalarni bosadi, matnni "tushunishi" shart emas.
- QZ Tray — kompyuterda ishlaydigan kichik dastur; brauzer u bilan `wss://localhost` orqali gaplashadi.
- So'rovlar **sertifikat bilan imzolanadi** → QZ "Allow" oynasini chiqarmaydi (pastga qarang).

---

## Fayllar

| Fayl                       | Vazifasi                                                                   |
| -------------------------- | -------------------------------------------------------------------------- |
| `types.ts`                 | `ReceiptData` tipi                                                         |
| `renderReceiptCanvas.ts`   | Chekni `<canvas>` ga chizadi (namuna formatda)                             |
| `escpos.ts`                | Canvas → **ESC/POS** raster (`GS v 0`, band-band)                          |
| `tspl.ts`                  | Canvas → **TSPL** raster (label printerlar uchun zaxira) + base64          |
| `qzPrint.ts`               | QZ Tray ulanish, printer tanlash, til (escpos/tspl), chop etish            |
| `qzSign.ts`                | So'rovlarni imzolash (RSA-SHA512, Web Crypto) — "Allow" oynasini yo'qotadi |
| `webSerialPrint.ts`        | Web Serial zaxira yo'li (printer COM port bo'lsa)                          |
| `numberToWords.ts`         | Summani o'zbekcha so'z bilan ("бир миллион сўм") + sana format             |
| `ReceiptPrinter.tsx`       | Asosiy komponent: QZ → Web Serial → brauzer chopi tartibida                |
| `PrinterConnectButton.tsx` | Bir martalik "Printerni ulash" tugmasi (printer tanlash)                   |
| `Receipt.tsx`              | HTML ko'rinish (faqat brauzer chopi zaxirasi uchun)                        |

---

## Standart sozlamalar

- **Til:** `escpos` (`qzPrint.ts` dagi `getSavedLang` default). Kerak bo'lsa `localStorage.receiptLang = 'tspl'`.
- **Eni:** 72mm = **576 nuqta** (203 dpi). `renderReceiptCanvas(data, 576)`.
- **Printer nomi:** `localStorage.receiptPrinter` da saqlanadi (masalan `Xprinter XP-365B`).

---

## Yangi sahifaga chek qo'shish

```tsx
import { useState } from "react"
import { ReceiptData, ReceiptPrinter } from "@/components/receipt"

const [receipt, setReceipt] = useState<ReceiptData | null>(null)

// Chop etish kerak bo'lganda:
setReceipt({
    receiptNo: "1397",
    transaction: `${branchId}/${id}`,
    saleType: "Нақд савдо", // yoki 'Шартнома'
    saleCode: `${saleId}`,
    clientName: "Mijoz F.I.O",
    paymentPurpose: "Нақд савдо", // yoki 'Муддатли тўлов'
    branchName: "Фарғона филиали",
    cashier: "Kassir ismi",
    amount: 1000000,
    currency: "uzs", // 'uzs' | 'usd'
    qrValue: `sale:${saleId}`,
})

// JSX ichida (modal/drawer'dan TASHQARIDA bo'lsin, aks holda yopilganda print uzilib qoladi):
{
    receipt ?
        <ReceiptPrinter data={receipt} onFinish={() => setReceipt(null)} />
    :   null
}
```

> Eslatma: agar chop etish modal/drawer **muvaffaqiyatli yopilgandan keyin** bo'lsa,
> `ReceiptData` ni `useRef` ga saqlab, `onSuccess` da `setReceipt(ref.current)` qiling
> (forma tozalanishidan oldin). Misol: `pages/sales/SalesForCash.tsx`.

### `ReceiptData` maydonlari

Hammasi ixtiyoriy (`amount` dan tashqari) — bo'sh maydon qatori chekda ko'rsatilmaydi.

| Maydon                | Chekdagi yorlig'i                             |
| --------------------- | --------------------------------------------- |
| `receiptNo`           | Квитанция №                                   |
| `transaction`         | Транзакция                                    |
| `date`                | Сана (berilmasa — hozirgi vaqt)               |
| `saleType`            | Савдо тури                                    |
| `saleCode`            | Савдо коди                                    |
| `clientName`          | Мижоз ФИО (katta harf)                        |
| `paymentPurpose`      | Тўлов мақсади                                 |
| `branchName`          | Филиал номи                                   |
| `cashier`             | Кассир                                        |
| `amount` + `currency` | Pastdagi katta summa + so'z bilan             |
| `qrValue`             | QR kod (berilmasa transaction/saleCode)       |
| `shopName`            | Do'kon nomi (default `SMARTLIFE`)             |
| `header`              | Tepa matn (default `Тўловингиз учун раҳмат!`) |

Hozir chek **5 joyda** chiqadi: `PaymentModal`, `SalesForCash`,
`cashsale-requests/Modal/AddModal`, `termsale-requests/Modal/AddModal`,
`income-expenses/logs` (har qatorda "Chek" tugmasi).

---

## Kompyuterni sozlash (har bir kassada bir marta)

### 1. QZ Tray o'rnatish

- https://qz.io/download — Windows versiyasi. O'rnatgach tray'da (o'ng past, ▲ ostida) yashil belgi turadi.

### 2. "Allow" oynasini yo'qotish (sertifikat)

Imzolangan so'rov uchun sertifikat QZ Tray papkasiga qo'yiladi:

1. Loyihadagi **`override.crt`** faylini oling.
2. QZ Tray o'rnatilgan papkaga ko'chiring (masalan `D:\qz tray\override.crt` yoki
   `C:\Program Files\QZ Tray\override.crt`).
3. QZ Tray'ni **qayta ishga tushiring** (tray → o'ng tugma → Exit → keyin `qz-tray.exe` ni qayta oching).

Endi chek bosilganda "Action Required / Allow" oynasi **chiqmaydi** (so'rov "Trusted" bo'ladi).

> Sertifikat o'rnatilmasa ham ishlaydi, lekin har safar "Allow" so'raydi
> (yoki "Remember this decision" + Allow bilan bir marta ruxsat berish kerak).

### 3. Printerni ulash

- Ilovada **"Printerni ulash"** tugmasini bosing → ro'yxatdan **XP-365B** ni tanlang → Saqlash.
- Tanlov `localStorage` da saqlanadi; keyin barcha cheklar avtomatik shu printerga chiqadi.

---

## Sertifikat (imzo) haqida

- Sertifikat + private key `openssl` bilan yaratilgan (RSA-2048, 20 yil), `qzSign.ts` ichiga embed qilingan.
- QZ default imzo algoritmi: **SHA512 + RSA** (`qz.security.setSignatureAlgorithm('SHA512')`).
- Imzolash brauzerda **Web Crypto** (`RSASSA-PKCS1-v1_5`, SHA-512) bilan bajariladi — qo'shimcha kutubxonasiz.

**Xavfsizlik:** private key frontend bundleда bo'ladi. Bu — **ichki POS** ilovasi uchun maqbul:
kalit faqat `override.crt` o'rnatilgan kompyuterlarda QZ'ga chop etishga ruxsat beradi, boshqa
zarar yetkaza olmaydi. `qz-private-key.pem` `.gitignore` da (commit qilinmaydi).

### Sertifikatni qayta yaratish (kerak bo'lsa)

```bash
openssl req -x509 -newkey rsa:2048 -keyout qz-private-key.pem \
  -out qz-digital-certificate.txt -days 7300 -nodes \
  -subj "/CN=SmartLife POS/OU=POS/O=SmartLife"
```

So'ng:

- `qz-digital-certificate.txt` tarkibini `qzSign.ts` dagi `CERTIFICATE` ga va `override.crt` ga qo'ying.
- `qz-private-key.pem` tarkibini `qzSign.ts` dagi `PRIVATE_KEY` ga qo'ying.
- Har bir kassada yangi `override.crt` ni almashtirib, QZ Tray'ni restart qiling.

---

## Til (ESC/POS ⇄ TSPL)

Printer tilini bilmasangiz, ikkalasini sinab ko'ring:

- ESC/POS: `localStorage.receiptLang = 'escpos'` (standart)
- TSPL (label printerlar): `localStorage.receiptLang = 'tspl'`

XP-365B → **ESC/POS** to'g'ri ishladi.

---

## Muammolarni hal qilish

| Muammo                    | Yechim                                                                      |
| ------------------------- | --------------------------------------------------------------------------- |
| Ahlat belgilar chiqyapti  | Til noto'g'ri. `receiptLang` ni `escpos` ↔ `tspl` o'zgartiring              |
| Chek teskari (qora fon)   | `escpos.ts`/`tspl.ts` da bit konvensiyasini teskari qiling                  |
| Faqat 1-2 sm chiqyapti    | ESC/POS band balandligi (`BAND_HEIGHT`) — `escpos.ts`                       |
| Eni kesilgan / kichik     | `renderReceiptCanvas(data, <nuqta>)` — 576 (72mm) yoki 512                  |
| "Allow" oynasi chiqaversa | `override.crt` joyida emas / QZ restart bo'lmagan                           |
| "Allow" tugmasi yonmaydi  | QZ oynasini bosib fokus bering yoki `override.crt` bilan butunlay yo'qoting |
| Printer topilmadi         | QZ Tray ishlayotganini va printer Windows'da o'rnatilganini tekshiring      |
| QZ bo'lmasa               | Web Serial (COM port) yoki brauzer print dialogiga avtomatik qaytadi        |

---

## Bog'liq kutubxonalar

- `qz-tray` — QZ Tray bilan aloqa
- `qrcode` — QR matritsasi (canvas'ga chiziladi)
- `react-to-print` — brauzer print zaxirasi
