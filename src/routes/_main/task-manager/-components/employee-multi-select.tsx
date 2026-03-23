import type { Admin } from "@/routes/_main/admins/-types"
import { Check, ChevronDown, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Props {
    options: Admin[]
    value: number[]
    onChange: (val: number[]) => void
    label?: string
    error?: string
}

export default function EmployeeMultiSelect({
    options,
    value,
    onChange,
    label,
    error,
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

    const toggle = (id: number) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id))
        } else {
            onChange([...value, id])
        }
    }

    const remove = (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(value.filter((v) => v !== id))
    }

    const selected = options.filter((o) => value.includes(o.id))

    return (
        <div ref={ref} className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium">{label}</label>}
            <div
                className="border rounded px-3 py-2 min-h-[40px] flex flex-wrap gap-1 items-center cursor-pointer"
                onClick={() => setOpen((v) => !v)}
            >
                {selected.length === 0 && (
                    <span className="text-muted-foreground text-sm">
                        Select employees...
                    </span>
                )}
                {selected.map((emp) => (
                    <span
                        key={emp.id}
                        className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                        {emp.first_name} {emp.last_name}
                        <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={(e) => remove(emp.id, e)}
                        />
                    </span>
                ))}
                <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
            </div>
            {open && (
                <div className="border rounded shadow-md bg-white max-h-52 overflow-y-auto z-50 relative">
                    {options.map((emp) => (
                        <div
                            key={emp.id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => toggle(emp.id)}
                        >
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${value.includes(emp.id) ? "bg-primary border-primary" : "border-muted-foreground"}`}
                            >
                                {value.includes(emp.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                            <span>
                                {emp.first_name} {emp.last_name}
                            </span>
                            {emp.role && (
                                <span className="ml-auto text-xs text-muted-foreground capitalize">
                                    {emp.role}
                                </span>
                            )}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No employees found
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}
