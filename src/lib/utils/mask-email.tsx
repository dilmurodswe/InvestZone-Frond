/**
 * Mask an email address.
 *
 * Examples:
 *   maskEmail("caz123@example.com") -> "caz****@****"
 *   maskEmail("ab@domain.ru")        -> "ab****@****"  (keeps up to 3 local chars)
 *
 * Defaults produce the output style you asked for: "caz****@****".
 */
export function maskEmail(
    email: string,
    opts?: {
        visibleLocal?: number // how many chars of local part to keep (default 3)
        localMaskCount?: number // number of stars after visible local (default 4)
        maskDomain?: boolean // whether to replace domain with stars (default true)
        domainMask?: string // mask string for domain when maskDomain=true (default "****")
    },
): string {
    const {
        visibleLocal = 3,
        localMaskCount = 4,
        maskDomain = true,
        domainMask = "****",
    } = opts ?? {}

    if (!email || typeof email !== "string")
        throw new TypeError("email must be a non-empty string")

    const atIndex = email.indexOf("@")
    if (atIndex <= 0) return email // invalid format — return as-is

    const local = email.slice(0, atIndex)
    // const domain = email.slice(atIndex + 1); // not used if masked

    const visible = local.slice(
        0,
        Math.max(0, Math.min(visibleLocal, local.length)),
    )
    const localMask = "*".repeat(localMaskCount)

    const left = visible + localMask
    const right = maskDomain ? domainMask : email.slice(atIndex + 1)

    return `${left}@${right}`
}
