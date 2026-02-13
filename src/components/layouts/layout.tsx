import { cn } from "@/lib/utils/shadcn"

type Props = { children: React.ReactNode; className?: string }

export default function Layout({ children, className }: Props) {
    return (
        <main className={cn(`p-4 flex flex-col gap-5 flex-1`, className)}>
            {children}
        </main>
    )
}
