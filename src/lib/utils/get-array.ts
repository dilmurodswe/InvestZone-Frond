export function getArray<T>(val: T[] | undefined | null | string): T[] {
    const arr = Array.isArray(val) ? val : []
    return arr
}
