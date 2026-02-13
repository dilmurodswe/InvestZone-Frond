import { CardHeader } from "@/components/ui/card"

interface Props {
    text: string
}

export default function FormTitle({ text }: Props) {
    return (
        <CardHeader className="clamp-[text,xl,3xl] font-semibold">
            {text}
        </CardHeader>
    )
}
