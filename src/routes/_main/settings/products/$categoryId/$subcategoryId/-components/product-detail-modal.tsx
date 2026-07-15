import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { round3 } from "@/lib/utils/format-number"
// import { useModal } from "@/hooks/use-modal"
import { useProductStore } from "../-hooks/use-product-store"

export default function ProductDetailModal() {
    return (
        <Modal modalKey="product-detail" title={null}>
            <ProductDetail />
        </Modal>
    )
}

function ProductDetail() {
    const { product } = useProductStore()
    // const { closeModal } = useModal("product-detail")

    if (!product) return null

    const extraEntries =
        product.extra_fields ? Object.entries(product.extra_fields) : []

    return (
        <div className="flex flex-col gap-5">
            <CardTitle>{product.name}</CardTitle>

            {/* Base info */}
            <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Code" value={product.code} />
                <DetailRow label="SKU" value={product.articul} />
                <DetailRow label="Price" value={round3(product.price)} />
                <DetailRow
                    label="Outer Dimension"
                    value={product.outer_dimension}
                />
                <DetailRow label="Толщина" value={product.thickness} />
            </div>

            {/* Extra fields */}
            {extraEntries.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Extra Fields
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {extraEntries.map(([key, val]) => (
                            <DetailRow
                                key={key}
                                label={key}
                                value={String(val)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            {product.description && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Description
                    </p>
                    <div
                        className="prose prose-sm max-w-none border rounded-lg p-3 bg-muted/20"
                        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                        dangerouslySetInnerHTML={{
                            __html: product.description,
                        }}
                    />
                </div>
            )}
        </div>
    )
}

function DetailRow({
    label,
    value,
}: {
    label: string
    value: string | number | undefined | null
}) {
    return (
        <div className="flex flex-col gap-0.5 bg-muted/30 rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground capitalize">
                {label}
            </span>
            <span className="text-sm font-medium">{value ?? "—"}</span>
        </div>
    )
}
