export function splitArray<T>(arr: T): [T, T] {
    // @ts-expect-error asd
    const midpoint = Math.ceil(arr.length / 2) // Find the midpoint
    // @ts-expect-error asd
    const firstHalf = arr.slice(0, midpoint) // First half up to the midpoint
    // @ts-expect-error asd
    const secondHalf = arr.slice(midpoint) // Second half from the midpoint

    return [firstHalf, secondHalf]
}
