import { Settings2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Props = {
    extraKeys: string[]
    visibleKeys: string[]
    onChange: (keys: string[]) => void
}

export function ExtraFieldColumnToggle({
    extraKeys,
    visibleKeys,
    onChange,
}: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const toggle = (key: string) => {
        if (visibleKeys.includes(key)) {
            if (visibleKeys.length === 1) return
            onChange(visibleKeys.filter((k) => k !== key))
        } else {
            onChange([...visibleKeys, key])
        }
    }

    if (extraKeys.length === 0) return null

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-muted transition-colors"
            >
                <Settings2 className="w-4 h-4" />
                Columns
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-xl shadow-lg p-2 min-w-[200px] flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground px-2 py-1 font-medium uppercase tracking-wide">
                        Extra Fields
                    </p>
                    {extraKeys.map((key) => {
                        const checked = visibleKeys.includes(key)
                        return (
                            <label
                                key={key}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(key)}
                                    className="rounded"
                                />
                                {key}
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
