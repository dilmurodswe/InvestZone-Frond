import AppendixPrintModal, {
    type AppendixSeed,
} from "@/components/print/appendix-print-modal"
import { useGet } from "@/hooks/react-query/use-get"
import { useModal } from "@/hooks/use-modal"
import { API } from "@/lib/constants/api-endpoints"
import type { AppendixItem } from "@/lib/print/appendix-types"
import type { Client } from "@/routes/_main/clients/-types"
import { useMemo } from "react"
import { useOrderStore } from "../-hooks/use-order-store"
import type { Order, OrderItem, OrderItemForm } from "../-types"
import { perTonFromPrice, weightPerMeter } from "./item-math"

export const ORDER_PRINT_MODAL = "order-print"

/**
 * «Грузополучатель» bloki mijozning rekvizitlaridan yig'iladi — buyurtma
 * javobida mijozning faqat nomi keladi, bank ma'lumotlari esa alohida
 * so'rovda.
 */
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

/**
 * Saqlangan pozitsiyani forma hisob-kitobi tushunadigan ko'rinishga soladi.
 * «Вес 1пм» va tonna narxi backenddan alohida maydon bo'lib kelmaydi — ular
 * tovar kartochkasidan o'sha formulalar bilan olinadi.
 */
const asFormItem = (item: OrderItem): OrderItemForm => ({
    id: item.id,
    product_id: item.product?.id ?? null,
    price: Number(item.price),
    quantity: Number(item.quantity),
    unit: item.unit,
    weight_mode: item.weight_mode,
    price_per_ton: Number(item.price_per_ton),
    discount: Number(item.discount),
    vat: item.vat,
    reserve: Number(item.reserve),
    product: item.product ?? null,
})

function buildSeed(order: Order, client?: Client): AppendixSeed {
    const buyerName =
        client?.official_name ||
        client?.company_name ||
        order.client?.company_name ||
        order.client?.full_name ||
        ""

    const owner = order.owner
    const docDate = order.doc_date?.slice(0, 10) ?? ""

    return {
        shipmentDate: order.delivery_planned_date || docDate,
        contractNumber: order.contract_number ?? "",
        lotNumber: order.lot_number ?? "",
        appendixNumber: order.number ?? "",
        // «Версия» приложения — это «Ревизия» заказа; до сохранения поля её
        // всё равно можно поправить прямо в окне печати.
        appendixVersion: order.revision ?? "",
        deliveryDeadline: order.delivery_planned_date ?? "",
        buyerName,
        consignee: consigneeOf(buyerName, client),
        paymentTermsTitle: order.payment_type ?? "",
        executor: owner ? `${owner.first_name} ${owner.last_name}`.trim() : "",
        // Chop etilgan jadvalda «Кол-во × Цена = Сумма» bo'lishi shart, shuning
        // uchun narx qaysi birlikka tegishli bo'lsa, miqdor ham o'shanda
        // yoziladi: tonnada — тонна, qolganida — hisoblangan metr.
        items: (order.items ?? [])
            .map((item): AppendixItem => {
                const isTon = item.unit === "ton"
                const form = asFormItem(item)
                const perMeterWeight = weightPerMeter(form)
                // «Цена» продажного листа, а не сырое поле строки: только
                // она даёт Кол-во × Цена = Сумма для позиции в тоннах.
                const unitPrice = Number(item.unit_price ?? item.price)
                return {
                    name:
                        item.product?.articul ?
                            `${item.product.name} — ${item.product.articul}`
                        :   (item.product?.name ?? ""),
                    unit: isTon ? "тн" : "м",
                    quantity: Number(
                        isTon ? item.quantity : item.quantity_base,
                    ),
                    price: unitPrice,
                    total: Number(
                        order.delivery_mode === "split" ?
                            item.line_total_with_delivery
                        :   item.line_total,
                    ),
                    // Narx varaqlari hamma narsani погонный метрga soladi:
                    // tonnadagi qatorda ham «цена за пм» ko'rsatiladi, chunki
                    // varaqning butun mazmuni — tonna narxini metr narxi bilan
                    // solishtirish.
                    weightPerMeter: perMeterWeight,
                    quantityMeters: Number(item.quantity_base),
                    pricePerTon:
                        isTon ? unitPrice : perTonFromPrice(form, unitPrice),
                    pricePerTonDoc: Number(item.price_per_ton),
                    // Tonnadagi qatorda «цена» — tonna narxi, metrniki esa
                    // undan погонный метр og'irligi orqali chiqadi.
                    pricePerMeter:
                        isTon ? (perMeterWeight * unitPrice) / 1000 : unitPrice,
                }
            })
            .concat(
                // Yetkazib berish summaga qo'shilgan bo'lsa, u alohida qator
                // bo'lib chiqadi — shundagina qatorlar yig'indisi «Итого» ga
                // teng bo'ladi. «Разбить по товарам» rejimida u pozitsiyalar
                // ichiga tarqalgan, alohida qator kerak emas.
                //
                // Bu qatorda og'irlik ham, tonna narxi ham yo'q: narx
                // varaqlarida ularning o'rniga chiziqcha chiqadi.
                (
                    order.delivery_mode === "in_total" &&
                        Number(order.delivery_cost) > 0
                ) ?
                    ([
                        {
                            name: "Доставка",
                            unit: "",
                            quantity: 1,
                            price: Number(order.delivery_cost),
                            total: Number(order.delivery_cost),
                        },
                    ] as AppendixItem[])
                :   [],
            ),
        // Mijoz to'laydigan yakuniy summa — NDS va yetkazib berish bilan.
        total: Number(
            order.grand_total ||
                (order.vat_enabled ? order.total_with_vat : order.total_sum),
        ),
        currency: order.currency?.currency ?? "",
    }
}

export default function OrderPrintModal() {
    const { order } = useOrderStore()
    const { isOpen } = useModal(ORDER_PRINT_MODAL)

    // Ro'yxatdagi qator to'liq bo'lmasligi mumkin — pozitsiyalar detal so'rovdan.
    const { data } = useGet<Order>(
        API.ORDERS.ID.INDEX.replace("{id}", String(order?.id ?? "")),
        { options: { enabled: isOpen && !!order?.id } },
    )
    const { data: client } = useGet<Client>(
        API.CLIENT.USERS.ID.INDEX.replace(
            "{id}",
            String(order?.client?.id ?? ""),
        ),
        { options: { enabled: isOpen && !!order?.client?.id } },
    )

    const seed = useMemo(
        () => (data ? buildSeed(data, client) : null),
        [data, client],
    )

    // Fayl nomining boshiga forma nomini oynaning o'zi qo'yadi — beshta yuklab
    // olingan PDF bir papkada aralashib ketmasin.
    return (
        <AppendixPrintModal
            modalKey={ORDER_PRINT_MODAL}
            seed={seed}
            fileName={data?.number ?? ""}
        />
    )
}
