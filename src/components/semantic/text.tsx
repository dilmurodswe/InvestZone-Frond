import type { DetailedHTMLProps, HTMLAttributes } from "react"

export default function Text(
    props: DetailedHTMLProps<
        HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
    >,
) {
    return <p {...props} />
}
