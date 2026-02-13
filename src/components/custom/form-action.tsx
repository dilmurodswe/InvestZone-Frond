import { cn } from "@/lib/utils/shadcn"
import { Button, buttonVariants } from "../ui/button"
import { DialogClose } from "../ui/dialog"

type Props = {
    loading?: boolean
    className?: string
    disabled?: boolean
    submitName?: string
    isModal?: boolean
}

export default function FormAction({
    loading,
    disabled,
    className,
    submitName = "Save",
    isModal = true,
}: Props) {
    return (
        <div className={cn("grid grid-cols-2 gap-2 mt-3", className)}>
            {isModal && (
                <DialogClose disabled={disabled || loading} asChild>
                    <div className={cn(buttonVariants({ variant: "outline" }))}>
                        Cancel
                    </div>
                </DialogClose>
            )}
            <Button isLoading={loading} type="submit" disabled={disabled}>
                {submitName}
            </Button>
        </div>
    )
}
