import placeHolderImg from "@/assets/images/placeholder.jpg"
import { cn } from "@/lib/utils/shadcn"
import { useState } from "react"

type Props = React.ImgHTMLAttributes<HTMLImageElement>
export default function Img({ className, src, ...props }: Props) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <img
            onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = placeHolderImg
            }}
            onLoad={() => {
                setIsLoading(false)
            }}
            loading="lazy"
            className={cn(
                "duration-300 delay-75 ease-in-out rounded-md object-cover",
                isLoading ?
                    "scale-105 blur-sm grayscale"
                :   "scale-100 blur-0 grayscale-0",
                className,
            )}
            src={src || placeHolderImg}
            crossOrigin={src?.includes("://cdn") ? undefined : "anonymous"}
            {...props}
        />
    )
}
