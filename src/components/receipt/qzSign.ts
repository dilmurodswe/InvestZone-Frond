// QZ Tray so'rovlarini imzolash (Web Crypto, RSA-SHA512).
// Sertifikat QZ Tray'da `override.crt` sifatida o'rnatilsa, so'rov "Trusted" bo'ladi
// va "Allow" oynasi UMUMAN chiqmaydi.
//
// DIQQAT: bu — ichki (internal) POS ilovasi uchun yechim. Private key frontend
// bundлeда bo'ladi; faqat shu sertifikat o'rnatilgan kompyuterlarda chop etishga
// ruxsat beradi, shuning uchun ichki foydalanish uchun maqbul.

const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIID VTCCAj2gAwIBAgIUNosxvgB1xFNiLfXDS+PR2JWhQx4wDQYJKoZIhvcNAQEL
BQAwOjEWMBQGA1UEAwwNU21hcnRMaWZlIFBPUzEMMAoGA1UECwwDUE9TMRIwEAYD
VQQKDAlTbWFydExpZmUwHhcNMjYwNjA4MTI0NDAxWhcNNDYwNjAzMTI0NDAxWjA6
MRYwFAYDVQQDDA1TbWFydExpZmUgUE9TMQwwCgYDVQQLDANQT1MxEjAQBgNVBAoM
CVNtYXJ0TGlmZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALN2KQ9r
V/0pvwwW1jBQoWkjhGYXzbZiwk/rAJvwI1ilrdOAnCeXiNU7NCBiyP4AMr8Eri+4
izmH6vEGaOYxBZgXqlRh+/bTYlQBXRpRz9xvmAwgFgeMoLWgXSH4fQdV7pDOOcX+
SH5Me6XdqpUlo+1I3T25rXVfjKlOrSjUmqWAgJxGPGG1C2oeD4w0ZkGMKLV1ieVC
bbm4cMO3maWK6CpjforwBTWaAhGZk3Kp87xP4jAmN6eGiYoapltTd3CZHqScl9JJ
of9I3/KtLQ4tGJDaWT50Ppp/G3o2CmWHR/qFnyu72YIpkneLNl5990576ZJKWIfV
ufO+Dm5hzN/YzfUCAwEAAaNTMFEwHQYDVR0OBBYEFHVdPRKn4AQGa4zA3UiSoYqi
Ul1dMB8GA1UdIwQYMBaAFHVdPRKn4AQGa4zA3UiSoYqiUl1dMA8GA1UdEwEB/wQF
MAMBAf8wDQYJKoZIhvcNAQELBQADggEBAAcALzaVAGbpTiDz1J7Um8iBliI+YVf7
BZ9iQvEM58FlDGbKmWzOrj3OZPcqw1MOsc7Z0lfQbqentqhGyDj/rQJV14pA3q8B
cjCwKD9ovYfmBtSiRykc6pvDxXpbLmDF8yzowFXL1CWcKuqfBVdLMTq+R/Zflroy
s0XhakYZ3X/XA3+MPDF7ofc7M5J81zDd7ereiGivZkInBLWGiuko75pbiK96dp/4
esnFTvfHaq117FBXoyrPpZljrs7kZIYWbT+sA5nkmd09Z9ZsHN+wxfXKYjGoBiRg
0ugdAKvPPmYdZLRbNy4+8ZqXVEVvG6/dP5YYReG6HtW/a9i3v/5OWpY=
-----END CERTIFICATE-----`

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzdikPa1f9Kb8M
FtYwUKFpI4RmF822YsJP6wCb8CNYpa3TgJwnl4jVOzQgYsj+ADK/BK4vuIs5h+rx
BmjmMQWYF6pUYfv202JUAV0aUc/cb5gMIBYHjKC1oF0h+H0HVe6QzjnF/kh+THul
3aqVJaPtSN09ua11X4ypTq0o1JqlgICcRjxhtQtqHg+MNGZBjCi1dYnlQm25uHDD
t5mliugqY36K8AU1mgIRmZNyqfO8T+IwJjenhomKGqZbU3dwmR6knJfSSaH/SN/y
rS0OLRiQ2lk+dD6afxt6Ngplh0f6hZ8ru9mCKZJ3izZeffdOe+mSSliH1bnzvg5u
Yczf2M31AgMBAAECggEADHLL0lf92H/G0s3auas+Jw7hpjtMd7ROCkEg37A+o22K
qzsmmdB3G2Np8D0p+ASHgJyQgJrqfWkiMOni6OTJoI0zsXrCgZKUJYOas7KtGntb
LqwjGw70LuUa0Lpt4c5iKAVGGKfU233urci8hm//+Puu7RMuJxAjr7LXbBejSouL
RdpiateYfJw0uWqVEuToHOEM62SU1x1sF4uC85LsYp8ErIvpBTUw4oRULavScJXp
VoUcxGHEpHQsyNKWCAs72DIg7j/QT8NowD5iLlNcjUGuU3LvXRnrtHgVX1dQl7a1
ksPeuf76ADf4VX7xxKjPtszxj4GqM65OwkvhnfYF2QKBgQD6xYZoC+iGLI09STIl
pzKcE66J9863DnuBOK7GnrDIV4IbZ325agqFSazoFptGy2pHle2LAw/0RgntqisJ
jJISSWmChAHQsbYrx6kr0UZYVPBkhnk+o7t0ZT5+kAwWkBJSjMOp4Noxb2zpgR5j
EMLOF93oFP1uN4I0FwacPc4rnwKBgQC3NAX7AnRfKUEBsuLNTYoltBHoXRfMFcSV
KYWy+s7dLK1kvV+8slH892JwAWSacoKcCtKP838yl7NloVAjaL4vaksCXP4g11S6
8fZ3OwMyLV85PpxZDKdzXUj77f6+l217naY4/FQ43o+SRdGZOA8iCEvB2irBPdaT
sL7eiYJd6wKBgAYlLQQDtrEDCnsD/iyaCk101gQfhHtL6Y7jGrVXUjG2o0OUp6oR
hSx6/7e4RhnYBkS20dlkO9HanYercd6MCVBVaDaAkaLRmAs+m1CtkjG78yAjg3kb
fg5+JKfpU8KByVEojertzasEdgDK3znCQWPXheKYERXQWmp4XfsaMKE1AoGAEnjc
YYLN2Qp/03wGAk1fMI4HgDZiv+EyARg+st03HnXyxcWScaRJQAhxlHmPe0MwiCtP
L9SNbrx9CjJJskhNZNqC1aoqtYUAthjPkRYSLG0GvO7jNNdhyvAM+9nzZaQ/Fce/
it9mXpWSRF1l1N0iKXxMpy8oQHPLvviDRkz3KCECgYApR3Fkv4EHsCikd3OUyIlL
sWX1kdrEmS3r9gmwUbye+8ftP5QZNwTVsPsDNgxFv1lqkhGmipA3vhkFddyD5/e5
N9g7dJmSW6ln4SK5+ke0Uv1d9hOjcb0gH6nrMvo6TX6Dm0QTkCy0lfkfuD8lEJsl
dLuCXGprYJu1byMzZoNgpQ==
-----END PRIVATE KEY-----`

export const getCertificate = (): string => CERTIFICATE

const pemToArrayBuffer = (pem: string): ArrayBuffer => {
    const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")
    const bin = atob(b64)
    const buf = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i)

    return buf.buffer
}

let keyPromise: Promise<CryptoKey> | null = null
const getKey = (): Promise<CryptoKey> => {
    if (!keyPromise) {
        keyPromise = crypto.subtle.importKey(
            "pkcs8",
            pemToArrayBuffer(PRIVATE_KEY),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
            false,
            ["sign"],
        )
    }

    return keyPromise
}

/** QZ bergan matnni imzolaydi va base64 qaytaradi. */
export const signData = async (toSign: string): Promise<string> => {
    const key = await getKey()
    const sig = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        key,
        new TextEncoder().encode(toSign),
    )
    const bytes = new Uint8Array(sig)
    let bin = ""
    for (const byte of bytes) bin += String.fromCharCode(byte)

    return btoa(bin)
}
