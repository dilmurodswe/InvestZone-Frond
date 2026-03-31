import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { useParams } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import type { Manufacture } from "../-types"
import ManufactureStatusBadge from "./status-badge"

export default function ManufactureDetail() {
    const { id } = useParams({ strict: false })
    const { data: manufacture, isLoading } = useGet<Manufacture>(
        API.MANUFACTURES.ID.replace("{id}", String(id)),
    )

    return (
        <>
            <Navbar
                links={[
                    { label: "Manufactures", to: "/manufactures" },
                    { label: `#${id}` },
                ]}
            />
            <Layout>
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {manufacture && (
                    <div className="flex flex-col gap-6 max-w-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Manufacture #{manufacture.id}
                            </h2>
                            <ManufactureStatusBadge
                                status={manufacture.status}
                            />
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody>
                                    {[
                                        ["Category", manufacture.category],
                                        [
                                            "Sub category",
                                            manufacture.sub_category,
                                        ],
                                        ["Product", manufacture.product],
                                        [
                                            "Raw item details",
                                            manufacture.raw_item_details,
                                        ],
                                        ["Stock", manufacture.stock],
                                        [
                                            "Created at",
                                            new Date(
                                                manufacture.created_at,
                                            ).toLocaleString(),
                                        ],
                                    ].map(([label, value]) => (
                                        <tr
                                            key={label}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 text-muted-foreground font-medium w-48">
                                                {label}
                                            </td>
                                            <td className="px-4 py-3">
                                                {value ?? "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    )
}
