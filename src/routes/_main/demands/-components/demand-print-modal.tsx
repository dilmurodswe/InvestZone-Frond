import AppendixPrintModal, {
    type AppendixSeed,
} from "@/components/print/appendix-print-modal"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import type { Client } from "@/routes/_main/clients/-types"
import { useMemo } from "react"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand } from "../-types"

export const DEMAND_PRINT_MODAL = "demand-print"

function consigneeOf(name: string, client?: Client): string {
    return [
        name,
        client?.bank_name ? `${client.bank_name},` : "",
        [
            client?.inn && `ИНН: ${client.inn}`,
            client?.mfo_code && `МФО: ${client.mfo_code}`,
        ]
            .filter(Boolean)
            .join(", "),
        client?.account_number ? `Р/С: ${client.account_number}` : "",
    ]
        .filter(Boolean)
        .join("\n")
}

function buildSeed(demand: Demand, client?: Client): AppendixSeed {
    const buyerName =
        client?.official_name ||
        client?.company_name ||
        demand.client?.company_name ||
        demand.client?.full_name ||
        ""

    const owner = demand.owner
    const docDate = demand.doc_date?.slice(0, 10) ?? ""

    return {
        shipmentDate: docDate,
        // Otgruzka buyurtmadan chiqqan bo'lsa — shartnoma raqami o'rniga
        // buyurtma raqami boshlang'ich qiymat sifatida qulay.
        contractNumber: demand.order_number ?? "",
        lotNumber: "",
        appendixNumber: demand.number ?? "",
        appendixVersion: "",
        deliveryDeadline: docDate,
        buyerName,
        consignee: consigneeOf(buyerName, client),
        paymentTermsTitle: "",
        executor: owner ? `${owner.first_name} ${owner.last_name}`.trim() : "",
        items: (demand.items ?? []).map((item) => ({
            name:
                item.product?.articul ?
                    `${item.product.name} — ${item.product.articul}`
                :   (item.product?.name ?? ""),
            unit: item.product?.unit ?? "",
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.line_total),
        })),
        total: Number(
            demand.vat_enabled ? demand.total_with_vat : demand.total_sum,
        ),
        currency: demand.currency?.currency ?? "",
    }
}

export default function DemandPrintModal() {
    const { demand } = useDemandStore()
    const { isOpen } = useModal(DEMAND_PRINT_MODAL)

    const { data } = useGet<Demand>(
        API.DEMANDS.ID.INDEX.replace("{id}", String(demand?.id ?? "")),
        { options: { enabled: isOpen && !!demand?.id } },
    )
    const { data: client } = useGet<Client>(
        API.CLIENT.USERS.ID.INDEX.replace(
            "{id}",
            String(demand?.client?.id ?? ""),
        ),
        { options: { enabled: isOpen && !!demand?.client?.id } },
    )

    const seed = useMemo(
        () => (data ? buildSeed(data, client) : null),
        [data, client],
    )

    return (
        <AppendixPrintModal
            modalKey={DEMAND_PRINT_MODAL}
            seed={seed}
            fileName={`Приложение-${data?.number ?? ""}`}
        />
    )
}
