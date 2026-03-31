import { createFileRoute } from "@tanstack/react-router"
import ManufactureDetail from "./-components/manufacture-detail"

export const Route = createFileRoute("/_main/manufactures/$id")({
    component: ManufactureDetail,
})
