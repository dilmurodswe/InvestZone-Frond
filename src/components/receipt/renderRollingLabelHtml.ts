/**
 * Prokatka yorlig'ini HTML/CSS ko'rinishida chizadi (canvas emas — shrift aniq,
 * chiroyli va vektor bo'ladi). Har bir pachka uchun alohida yorliq (80×130mm).
 *
 * Qog'oz oldindan bosilgan bo'lgani uchun CHOP ETISHDA faqat ma'lumot chiqadi:
 * maydon nomlari (EN/RU) + qiymatlar + QR. Logo/ramka/STZ ekranda faqat
 * KO'RSATISH (preview) uchun xira "yo'riqchi" sifatida chiziladi.
 *
 * Layout QOG'OZ ko'rinishida yoziladi (yuqorida shapka, pastda STZ). Printerga
 * chiqishda `rotate180` butun birkani aylantiradi.
 */

import {
    FOOTER_RESERVED_MM,
    HEADER_RESERVED_MM,
    LABEL_CERTIFICATIONS,
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    LEFT_PADDING_MM,
    NO_CALIBRATION,
    RIGHT_PADDING_MM,
    SHOW_CERT_TEXT,
    type LabelCalibration,
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

/** Bitta pachka yorlig'ining ichki HTML'i (bitta <div class="iz-label">). */
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

    const certHtml =
        SHOW_CERT_TEXT ?
            `<div class="iz-cert">${LABEL_CERTIFICATIONS.map(
                (c) => `<div>${esc(c)}</div>`,
            ).join("")}</div>`
        :   ""

    return `
  <div class="iz-label">
    <div class="iz-guide" aria-hidden="true">
      <div class="iz-guide-hole"></div>
      <div class="iz-guide-header">INVEST ZONE</div>
      <div class="iz-guide-sub">ТРУБНЫЙ МЕТАЛЛУРГИЧЕСКИЙ ЗАВОД</div>
      <div class="iz-guide-stz">STZ</div>
    </div>

    <div class="iz-content">
      <div class="iz-fields">${rowsHtml}</div>

      <div class="iz-footer">
        <img class="iz-qr" src="${qrDataUrl}" alt="QR" />
        ${certHtml}
      </div>
    </div>
  </div>`
}

/**
 * Yorliqlar uchun umumiy CSS.
 * @param cal — printer kalibrovkasi. Preview'da hech qanday siljish/aylanish
 *   qo'llanmaydi (NO_CALIBRATION), chunki preview "ideal" natijani ko'rsatadi.
 */
export function labelStyles(cal: LabelCalibration = NO_CALIBRATION): string {
    return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --iz-w: ${LABEL_WIDTH_MM}mm;
      --iz-h: ${LABEL_HEIGHT_MM}mm;
      --iz-header: ${HEADER_RESERVED_MM}mm;
      --iz-left: ${LEFT_PADDING_MM}mm;
      --iz-right: ${RIGHT_PADDING_MM}mm;
      --iz-footer: ${FOOTER_RESERVED_MM}mm;
      --iz-offset-x: ${cal.offsetXMm}mm;
      --iz-offset-y: ${cal.offsetYMm}mm;
      --iz-rotate: ${cal.rotate180 ? "180deg" : "0deg"};
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
    }

    /* Oldindan bosilgan qog'ozning xira yo'riqchisi — faqat ekranda */
    .iz-guide {
      position: absolute;
      inset: 0;
      border: 2.5mm solid rgba(220, 38, 38, 0.28);
      border-radius: 3mm;
      pointer-events: none;
    }
    .iz-guide-hole {
      position: absolute;
      top: 5mm;
      left: 50%;
      transform: translateX(-50%);
      width: 4mm;
      height: 4mm;
      border-radius: 50%;
      border: 0.4mm solid rgba(0, 0, 0, 0.18);
    }
    .iz-guide-header {
      position: absolute;
      top: 13mm;
      left: 0;
      right: 0;
      text-align: center;
      font-weight: 800;
      letter-spacing: 0.5px;
      font-size: 6mm;
      color: rgba(0, 0, 0, 0.16);
    }
    .iz-guide-sub {
      position: absolute;
      top: 21mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 2.2mm;
      font-weight: 700;
      color: rgba(220, 38, 38, 0.28);
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

    /* Chop etiladigan ma'lumot bloki (qog'oz koordinatalarida) */
    .iz-content {
      position: absolute;
      top: var(--iz-header);
      left: var(--iz-left);
      right: var(--iz-right);
      bottom: var(--iz-footer);
      display: flex;
      flex-direction: column;
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
      gap: 1.5mm;
      border-bottom: 0.3mm solid #000;
      min-height: 7mm;
    }

    .iz-label-cell {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.05;
    }
    .iz-en,
    .iz-ru {
      font-size: 2.3mm;
      font-weight: 700;
      letter-spacing: 0.1px;
      white-space: nowrap;
    }

    .iz-value-cell {
      flex: 0 1 auto;
      max-width: 55%;
      text-align: right;
      font-size: 3.4mm;
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
      padding-top: 1.5mm;
    }
    .iz-qr {
      width: 14mm;
      height: 14mm;
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
export function buildPrintDocument(
    labelsHtml: string[],
    cal: LabelCalibration,
): string {
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>&nbsp;</title>
    <style>
      @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm; margin: 0; }
      ${labelStyles(cal)}
      @media print {
        body { background: #fff !important; }
        /* Chop etishda oldindan bosilgan yo'riqchi ko'rinmasin */
        .iz-guide { display: none !important; }
        .iz-label {
          page-break-after: always;
          break-after: page;
          /* Qog'oz printerga teskari kelgani uchun butun birkani aylantiramiz */
          transform: rotate(var(--iz-rotate));
          transform-origin: center center;
        }
        .iz-label:last-child {
          page-break-after: auto;
          break-after: auto;
        }
      }
    </style>
  </head>
  <body>
    ${labelsHtml.join("\n")}
  </body>
</html>`
}
