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
        // Buyurtmadagi kabi: «Кол-во × Цена = Сумма» bo'lishi uchun narx qaysi
        // birlikka tegishli bo'lsa, miqdor ham o'shanda yoziladi — tonnada
        // тонна, qolganida hisoblangan metr.
        items: (demand.items ?? [])
            .map((item) => {
                const isTon = item.unit === "ton"
                return {
                    name:
                        item.product?.articul ?
                            `${item.product.name} — ${item.product.articul}`
                        :   (item.product?.name ?? ""),
                    unit: isTon ? "тн" : "м",
                    quantity: Number(
                        isTon ? item.quantity : item.quantity_base,
                    ),
                    price: Number(item.unit_price ?? item.price),
                    total: Number(
                        demand.delivery_mode === "split" ?
                            item.line_total_with_delivery
                        :   item.line_total,
                    ),
                }
            })
            .concat(
                // Yetkazib berish summaga qo'shilgan bo'lsa — alohida qator,
                // shundagina qatorlar yig'indisi «Итого» ga teng bo'ladi.
                (
                    demand.delivery_mode === "in_total" &&
                        Number(demand.delivery_cost) > 0
                ) ?
                    [
                        {
                            name: "Доставка",
                            unit: "",
                            quantity: 1,
                            price: Number(demand.delivery_cost),
                            total: Number(demand.delivery_cost),
                        },
                    ]
                :   [],
            ),
        total: Number(
            demand.grand_total ||
                (demand.vat_enabled ? demand.total_with_vat : demand.total_sum),
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
