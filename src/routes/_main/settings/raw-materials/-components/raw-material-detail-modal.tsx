import Modal from "@/components/custom/modal"
import { CardTitle } from "@/components/ui/card"
import { useRawMaterialStore } from "../-hooks/use-raw-material-store"

export default function RawMaterialDetailModal() {
    return (
        <Modal modalKey="raw-material-detail" title={null}>
            <RawMaterialDetail />
        </Modal>
    )
}

function RawMaterialDetail() {
    const { rawMaterial } = useRawMaterialStore()

    if (!rawMaterial) return null

    const extraEntries =
        rawMaterial.extra_fields ? Object.entries(rawMaterial.extra_fields) : []

    return (
        <div className="flex flex-col gap-5">
            <CardTitle>{rawMaterial.name}</CardTitle>

            {/* Base info */}
            <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Standard" value={rawMaterial.standard} />
                <DetailRow label="Mark" value={rawMaterial.mark} />
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
            {rawMaterial.description && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Description
                    </p>
                    <div
                        className="prose prose-sm max-w-none border rounded-lg p-3 bg-muted/20"
                        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                        dangerouslySetInnerHTML={{
                            __html: rawMaterial.description,
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
