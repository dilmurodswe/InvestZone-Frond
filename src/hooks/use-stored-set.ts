import { useCallback, useEffect, useState } from "react"

const read = (key: string): Set<string> => {
    try {
        const raw = localStorage.getItem(key)
        const parsed: unknown = raw ? JSON.parse(raw) : null
        return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
    } catch {
        // Приватный режим, испорченное значение — начинаем с пустого набора.
        return new Set()
    }
}

/**
 * Набор строк, переживающий перезагрузку страницы.
 *
 * Для настроек вида «какие колонки скрыть»: пользователь настраивает таблицу
 * один раз, и после F5 она должна открыться такой же. Хранится в
 * `localStorage` — это личное предпочтение, серверу оно не нужно.
 */
export function useStoredSet(key: string) {
    const [value, setValue] = useState<Set<string>>(() => read(key))

    // Ключ может смениться (другая таблица) — читаем её сохранённый набор.
    useEffect(() => {
        setValue(read(key))
    }, [key])

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify([...value]))
        } catch {
            // Не смогли сохранить — настройка просто не переживёт перезагрузку.
        }
    }, [key, value])

    /** Есть — убрать, нет — добавить. */
    const toggle = useCallback((item: string) => {
        setValue((prev) => {
            const next = new Set(prev)
            if (!next.delete(item)) next.add(item)
            return next
        })
    }, [])

    return { value, toggle, setValue }
}
