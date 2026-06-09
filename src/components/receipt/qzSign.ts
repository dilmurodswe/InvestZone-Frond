/**
 * QZ Tray certificate signing with Web Crypto API
 * Eliminates "Allow" dialog when override.crt is installed in QZ Tray folder
 */

// Self-signed certificate (valid 20 years)
const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDNzCCAh+gAwIBAgIUJZX9Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3YwDQYJKoZIhvcNAQEL
BQAwKzEQMA4GA1UEAwwHU21hcnRMaWZlMRcwFQYDVQQLDA5TbWFydExpZmUgUE9T
MB4XDTIzMDEwMTAwMDAwMFoXDTQzMDEwMTAwMDAwMFowKzEQMA4GA1UEAwwHU21h
cnRMaWZlMRcwFQYDVQQLDA5TbWFydExpZmUgUE9TMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAw1Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
QIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAw1Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3
-----END CERTIFICATE-----`

// Private key (WARNING: embedded in frontend — acceptable for internal POS only)
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDVndndndndndn
dndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndn
dndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndn
dndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndn
dndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndndn
dndndndndndndndndndndndndndndndndndAgMBAAECggEBAMNWd2d2d2d2d2d2d2d2
d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2
AoGBAMNWd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2AoGBAMNWd2d2d2d2d2d2
d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2AkEAw1Z3Z3Z3Z3Z3Z3Z3Z3Z3
-----END PRIVATE KEY-----`

let cryptoKey: CryptoKey | null = null

/**
 * Import the private key for signing (one-time init)
 */
async function getSigningKey(): Promise<CryptoKey> {
    if (cryptoKey) return cryptoKey

    // Remove PEM headers/footers
    const pemBody = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\s/g, "")

    const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

    cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-512",
        },
        false,
        ["sign"],
    )

    return cryptoKey
}

/**
 * Sign a request string with RSA-SHA512 (QZ Tray format)
 */
export async function signRequest(requestString: string): Promise<string> {
    const key = await getSigningKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(requestString)

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data)

    // Convert to hex string (QZ expects hex signature)
    const signatureArray = new Uint8Array(signature)
    const hexSignature = Array.from(signatureArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return hexSignature
}

export function getCertificate(): string {
    return CERTIFICATE
}
