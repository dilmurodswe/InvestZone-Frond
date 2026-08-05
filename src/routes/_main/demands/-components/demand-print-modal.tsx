import DemandPrintModalView, {
    type DemandSeed,
} from "@/components/print/demand-print-modal"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import type { DemandItem as PrintItem } from "@/lib/print/demand-types"
import type { Client } from "@/routes/_main/clients/-types"
import { weightPerMeter } from "@/routes/_main/orders/-components/item-math"
import type { OrderItemForm } from "@/routes/_main/orders/-types"
import { useMemo } from "react"
import { useDemandStore } from "../-hooks/use-demand-store"
import type { Demand, DemandItem } from "../-types"

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

/** «Расходная накладная» sarlavhasidagi xaridor rekviziti — bitta qatorda. */
function buyerDetailsOf(name: string, client?: Client): string {
    return [
        name,
        client?.legal_address || client?.region_address,
        client?.inn && `ИНН: ${client.inn}`,
        client?.okpo_code && `ОКПО: ${client.okpo_code}`,
    ]
        .filter(Boolean)
        .join(", ")
}

/** Vazn ustuni tovar kartochkasidagi погонный метр og'irligidan chiqadi. */
const asFormItem = (item: DemandItem): OrderItemForm => ({
    id: item.id,
    product_id: item.product?.id ?? null,
    price: Number(item.price),
    quantity: Number(item.quantity),
    unit: item.unit,
    weight_mode: item.weight_mode,
    price_per_ton: Number(item.price_per_ton),
    discount: Number(item.discount),
    vat: item.vat,
    reserve: 0,
    product: item.product ?? null,
})

function buildSeed(demand: Demand, client?: Client): DemandSeed {
    const buyerName =
        client?.official_name ||
        client?.company_name ||
        demand.client?.company_name ||
        demand.client?.full_name ||
        ""

    const owner = demand.owner
    const docDate = demand.doc_date?.slice(0, 10) ?? ""

    return {
        number: demand.number ?? "",
        docDate,
        // Otgruzka buyurtmadan chiqqan bo'lsa — shartnoma raqami o'rniga
        // buyurtma raqami boshlang'ich qiymat sifatida qulay.
        contractNumber: demand.order_number ?? "",
        lotNumber: "",
        appendixNumber: demand.order_number ?? "",
        appendixVersion: "",
        appendixDate: docDate,

        buyerName,
        buyerInn: client?.inn ?? "",
        buyerDetails: buyerDetailsOf(buyerName, client),
        consignee: consigneeOf(buyerName, client),
        warehouseName: "",

        transportType: "",
        carModel: demand.cargo_name ?? "",
        carNumber: demand.transport_number ?? "",
        driver: "",
        carrier: demand.carrier ?? "",
        waybillNumber: demand.waybill_number ?? "",
        contractLine: demand.order_number ?? "",
        loadingPoint: "",
        loadingPoint2: "",
        unloadingPoint: demand.shipment_address ?? "",
        unloadingPoint2: "",
        redirection: "",
        newConsigneeAddress: demand.shipment_address ?? "",
        cargoDocuments: "",
        packageKind: "",
        placesCount:
            demand.places_count != null ? String(demand.places_count) : "",
        weightMethod: "",
        cargoClass: "",
        executor: owner ? `${owner.first_name} ${owner.last_name}`.trim() : "",

        // Buyurtmadagi kabi: «Кол-во × Цена = Сумма» bo'lishi uchun narx qaysi
        // birlikka tegishli bo'lsa, miqdor ham o'shanda yoziladi — tonnada
        // тонна, qolganida hisoblangan metr.
        items: (demand.items ?? [])
            .map((item): PrintItem => {
                const isTon = item.unit === "ton"
                const perMeter = weightPerMeter(asFormItem(item))
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
                    // «Вес (кг)»: saqlangan tonnadan, u bo'lmasa kartochkadagi
                    // погонный метр og'irligidan.
                    weightKg:
                        Number(item.weight_tn) > 0 ?
                            Number(item.weight_tn) * 1000
                        :   perMeter * Number(item.quantity_base),
                }
            })
            .concat(
                // Yetkazib berish summaga qo'shilgan bo'lsa — alohida qator,
                // shundagina qatorlar yig'indisi «Итого» ga teng bo'ladi.
                (
                    demand.delivery_mode === "in_total" &&
                        Number(demand.delivery_cost) > 0
                ) ?
                    ([
                        {
                            name: "Доставка",
                            unit: "шт",
                            quantity: 1,
                            price: Number(demand.delivery_cost),
                            total: Number(demand.delivery_cost),
                        },
                    ] as PrintItem[])
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
        <DemandPrintModalView
            modalKey={DEMAND_PRINT_MODAL}
            seed={seed}
            fileName={data?.number ?? ""}
        />
    )
}
