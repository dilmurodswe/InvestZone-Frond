/**
 * Prokatka yorlig'ini HTML/CSS ko'rinishida chizadi (canvas emas — shrift aniq,
 * chiroyli va vektor bo'ladi). Har bir pachka uchun alohida yorliq (80×130mm).
 *
 * Qog'oz oldindan bosilgan bo'lgani uchun CHOP ETISHDA faqat ma'lumot chiqadi:
 * maydon nomlari (EN/RU) + qiymatlar + QR + sertifikat matni. Logo/ramka/STZ
 * ekranda faqat KO'RSATISH (preview) uchun xira "yo'riqchi" sifatida chiziladi.
 */

import {
    FOOTER_RESERVED_MM,
    HEADER_RESERVED_MM,
    LABEL_CERTIFICATIONS,
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    LEFT_PADDING_MM,
    OFFSET_X_MM,
    OFFSET_Y_MM,
    RIGHT_PADDING_MM,
} from "./rollingLabelConstants"
import { metersFromMm } from "./rollingLabelQr"
import type { RollingLabelData, RollingPackData } from "./types"

const esc = (v: unknown): string =>
    String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c]!,
    )

type FieldRow = { en: string; ru: string; value: string }

function buildRows(data: RollingLabelData, pack: RollingPackData): FieldRow[] {
    return [
        { en: "DATE", ru: "ДАТА", value: data.productionDate },
        {
            en: "TUBE SIZE, MM",
            ru: "РАЗМЕР ТРУБЫ, ММ",
            value: data.tubeSize,
        },
        {
            en: "SPECIFICATION",
            ru: "СТАНДАРТ НТД",
            value: data.specification || data.standard,
        },
        {
            en: "STEEL GRADE",
            ru: "МАРКА СТАЛИ",
            value: data.steelGrade,
        },
        {
            en: "BATCH No.",
            ru: "ПАРТИЯ №",
            value: data.planNumber,
        },
        {
            en: "PACK No.",
            ru: "ПАЧКА №",
            value: pack.packNumber,
        },
        {
            en: "LENGTH, M",
            ru: "ДЛИНА, М",
            value: metersFromMm(data.length),
        },
        {
            en: "TOTAL LENGTH, M",
            ru: "ОБЩАЯ ДЛИНА, М",
            value: data.totalLength != null ? String(data.totalLength) : "—",
        },
    ]
}

/**
 * Bitta pachka yorlig'ining ichki HTML'i (bitta <div class="iz-label">).
 * @param withGuide — ekran preview'i uchun oldindan bosilgan yo'riqchini chizadi.
 */
export function renderPackLabelHtml(
    data: RollingLabelData,
    pack: RollingPackData,
    qrDataUrl: string,
): string {
    const rows = buildRows(data, pack)

    const rowsHtml = rows
        .map(
            (r) => `
        <div class="iz-row">
          <div class="iz-label-cell">
            <span class="iz-en">${esc(r.en)}</span>
            <span class="iz-ru">${esc(r.ru)}</span>
          </div>
          <div class="iz-value-cell">${esc(r.value)}</div>
        </div>`,
        )
        .join("")

    const certHtml = LABEL_CERTIFICATIONS.map(
        (c) => `<div>${esc(c)}</div>`,
    ).join("")

    return `
  <div class="iz-label">
    <div class="iz-guide" aria-hidden="true">
      <div class="iz-guide-header">INVEST ZONE</div>
      <div class="iz-guide-stz">STZ</div>
    </div>

    <div class="iz-content">
      <div class="iz-fields">${rowsHtml}</div>

      <div class="iz-footer">
        <img class="iz-qr" src="${qrDataUrl}" alt="QR" />
        <div class="iz-cert">${certHtml}</div>
      </div>
    </div>
  </div>`
}

/** Yorliqlar uchun umumiy CSS (preview va print bir xil ko'rinsin). */
export function labelStyles(): string {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --iz-w: ${LABEL_WIDTH_MM}mm;
      --iz-h: ${LABEL_HEIGHT_MM}mm;
      --iz-header: ${HEADER_RESERVED_MM}mm;
      --iz-left: ${LEFT_PADDING_MM}mm;
      --iz-right: ${RIGHT_PADDING_MM}mm;
      --iz-footer: ${FOOTER_RESERVED_MM}mm;
      --iz-offset-x: ${OFFSET_X_MM}mm;
      --iz-offset-y: ${OFFSET_Y_MM}mm;
    }

    body {
      background: #e5e7eb;
      font-family: "Inter", "Arial", "Helvetica Neue", Helvetica, sans-serif;
      color: #000;
      -webkit-font-smoothing: antialiased;
    }

    .iz-label {
      position: relative;
      width: var(--iz-w);
      height: var(--iz-h);
      background: #fff;
      overflow: hidden;
      page-break-after: always;
    }

    /* Oldindan bosilgan qog'ozning xira yo'riqchisi — faqat ekranda */
    .iz-guide {
      position: absolute;
      inset: 0;
      border: 2.5mm solid rgba(220, 38, 38, 0.28);
      border-radius: 3mm;
      pointer-events: none;
    }
    .iz-guide-header {
      position: absolute;
      top: 10mm;
      left: 0;
      right: 0;
      text-align: center;
      font-weight: 800;
      letter-spacing: 0.5px;
      font-size: 6mm;
      color: rgba(0, 0, 0, 0.16);
    }
    .iz-guide-stz {
      position: absolute;
      bottom: 4mm;
      right: 6mm;
      width: 10mm;
      height: 10mm;
      border-radius: 50%;
      border: 0.4mm solid rgba(37, 99, 235, 0.3);
      color: rgba(37, 99, 235, 0.3);
      font-size: 3mm;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Chop etiladigan ma'lumot bloki */
    .iz-content {
      position: absolute;
      top: var(--iz-header);
      left: var(--iz-left);
      right: var(--iz-right);
      bottom: var(--iz-footer);
      display: flex;
      flex-direction: column;
      /* Kalibrovka uchun butun blokni surish (o'ng/past = musbat) */
      transform: translate(var(--iz-offset-x), var(--iz-offset-y));
    }

    .iz-fields {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      border-top: 0.5mm solid #000;
    }

    .iz-row {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      gap: 2mm;
      border-bottom: 0.3mm solid #000;
      min-height: 8mm;
    }

    .iz-label-cell {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.05;
    }
    .iz-en {
      font-size: 2.5mm;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .iz-ru {
      font-size: 2.5mm;
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    .iz-value-cell {
      flex: 0 0 auto;
      max-width: 62%;
      text-align: right;
      font-size: 3.6mm;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .iz-footer {
      flex: 0 0 auto;
      display: flex;
      align-items: flex-end;
      gap: 2.5mm;
      padding-top: 2mm;
    }
    .iz-qr {
      width: 16mm;
      height: 16mm;
      display: block;
      image-rendering: pixelated;
    }
    .iz-cert {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 0.6mm;
      font-size: 2.2mm;
      font-weight: 600;
      letter-spacing: 0.1px;
      color: #000;
    }
  `
}

/** Print oynasi uchun to'liq HTML hujjat (har pachka alohida sahifada). */
export function buildPrintDocument(labelsHtml: string[]): string {
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>Prokatka yorliqlari</title>
    <style>
      @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm; margin: 0; }
      @media print {
        body { background: #fff !important; }
        /* Chop etishda oldindan bosilgan yo'riqchi ko'rinmasin */
        .iz-guide { display: none !important; }
        .iz-label { page-break-after: always; }
        .iz-label:last-child { page-break-after: auto; }
      }
      ${labelStyles()}
    </style>
  </head>
  <body>
    ${labelsHtml.join("\n")}
  </body>
</html>`
}
