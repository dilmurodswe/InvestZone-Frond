import type { DetailedHTMLProps, HTMLAttributes } from "react"

export default function Group(
    props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
    return <div {...props} />
}
