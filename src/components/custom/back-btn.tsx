import { type NavigateOptions, useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"

type Props = {
    className?: string
    text?: string
    navigateOptions?: NavigateOptions
}

export default function BackBtn({
    className = "",
    text = "Back",
    navigateOptions,
}: Props) {
    const navigate = useNavigate()

    const clickHandler = () => {
        if (navigateOptions) {
            navigate(navigateOptions)
        } else window.history.back()
    }

    return (
        <Button
            className={className}
            onClick={clickHandler}
            variant={"outline"}
            size={"sm"}
        >
            <ArrowLeft size={16} />
            {text}
        </Button>
    )
}
