type Arg = {
    data: Blob
    name?: string
    fileType?: string
    defaultName?: string
}

export function downloadExcel({
    data,
    name = "",
    fileType = ".xlsx",
    defaultName = new Date().toISOString(),
}: Arg) {
    const blob = new Blob([data])
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = name + "_" + defaultName + fileType
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
}
