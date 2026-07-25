/**
 * Tayyor PDF'ni chop etish yoki yuklab olish.
 *
 * Ikkalasi ham bitta blob'dan chiqadi — qog'ozdagi va yuklab olingan
 * fayldagi hujjat aynan bir xil bo'lishiga kafolat shu.
 */

import type { jsPDF } from "jspdf"

/**
 * Chop etish oynasini ochadi.
 *
 * `window.open` emas, yashirin iframe: brauzerlar so'rov async tugagandan
 * keyin ochilgan oynani qalqib chiquvchi deb bloklaydi, iframe esa bloklanmaydi.
 */
export function printPdf(doc: jsPDF) {
    const url = doc.output("bloburl") as unknown as string
    const frame = document.createElement("iframe")

    frame.style.position = "fixed"
    frame.style.right = "0"
    frame.style.bottom = "0"
    frame.style.width = "0"
    frame.style.height = "0"
    frame.style.border = "0"
    frame.src = url

    frame.onload = () => {
        frame.contentWindow?.focus()
        frame.contentWindow?.print()
    }

    document.body.appendChild(frame)

    // Chop etish dialogi ochilgach freym kerak emas. Uni darrov olib tashlash
    // dialogni yopib yuboradi, shuning uchun keng oraliq beriladi.
    window.setTimeout(() => {
        frame.remove()
        URL.revokeObjectURL(url)
    }, 60_000)
}

export function downloadPdf(doc: jsPDF, fileName: string) {
    doc.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`)
}
