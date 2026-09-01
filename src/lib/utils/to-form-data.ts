/**
 * Builds a multipart FormData body from a plain object.
 * Skips `undefined`, `null` and `""`; appends File/Blob as-is, everything
 * else stringified. Use when a request carries a file alongside text fields.
 */
export function toFormData(obj: Record<string, unknown>): FormData {
    const fd = new FormData()
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === "") continue
        if (value instanceof File || value instanceof Blob) {
            fd.append(key, value)
        } else {
            fd.append(key, String(value))
        }
    }
    return fd
}
