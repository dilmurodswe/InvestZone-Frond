import { cn } from "@/lib/utils/shadcn"
import {
    Edit,
    EllipsisVertical,
    Eye,
    SquarePen,
    Trash2,
    Undo,
} from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type Props = {
    menuMode?: boolean
    onEdit?: () => void
    onDelete?: () => void
    onUndo?: () => void
    onView?: () => void
    className?: string
    additionalActions?: ReactNode[]
    isDeleting?: boolean
}

export default function TableActions({
    menuMode = false,
    onEdit,
    onDelete,
    onUndo,
    onView,
    className,
    additionalActions,
    isDeleting,
}: Props) {
    return menuMode ?
            <DropdownMenu>
                <DropdownMenuTrigger asChild className={className}>
                    <Button
                        variant="ghost"
                        className="text-primary!"
                        size={"icon"}
                        icon={<EllipsisVertical width={18} />}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={1}>
                    {onView && (
                        <DropdownMenuItem
                            onClick={onView}
                            className="text-green-500!"
                        >
                            <Eye width={16} />
                            Ko'rish
                        </DropdownMenuItem>
                    )}
                    {onEdit && (
                        <DropdownMenuItem
                            onClick={onEdit}
                            className="text-primary!"
                        >
                            <Edit width={16} />
                            Tahrirlash
                        </DropdownMenuItem>
                    )}
                    {onDelete && (
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive!"
                            disabled={isDeleting}
                        >
                            <Trash2 width={16} /> O'chirish
                        </DropdownMenuItem>
                    )}
                    {onUndo && (
                        <DropdownMenuItem
                            onClick={onUndo}
                            className="text-destructive!"
                        >
                            <Undo width={16} /> Qaytarish
                        </DropdownMenuItem>
                    )}
                    {additionalActions?.map((node) => node)}
                </DropdownMenuContent>
            </DropdownMenu>
        :   <div
                className={cn(
                    "flex items-center justify-center gap-3",
                    className,
                )}
            >
                {onView && (
                    <Button
                        icon={<Eye className="text-green-500" size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onView()
                        }}
                    ></Button>
                )}
                {onEdit && (
                    <Button
                        icon={<SquarePen className="text-primary" size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                    ></Button>
                )}
                {onDelete && (
                    <Button
                        icon={<Trash2 className="text-destructive" size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        disabled={isDeleting}
                    ></Button>
                )}
                {onUndo && (
                    <Button
                        icon={<Undo className="text-destructive" size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation()
                            onUndo()
                        }}
                    ></Button>
                )}
                {additionalActions?.map((node) => node)}
            </div>
}
