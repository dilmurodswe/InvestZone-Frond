import { useRequest } from "@/hooks/react-query/use-request"
import { useRevalidate } from "@/hooks/react-query/use-revalidate"
import { useModal } from "@/hooks/use-modal"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import Modal from "./modal"

interface IProps {
    path: string
    name?: ReactNode
    onSuccessAction?: () => void
    modalKey?: string
    invalidateByExactKeys?: string[]
    invalidateByPatternKeys?: string[]
}

export default function DeleteModal({
    path,
    name,
    onSuccessAction,
    modalKey = "delete",
    invalidateByExactKeys,
    invalidateByPatternKeys,
}: IProps) {
    const { closeModal } = useModal(modalKey)
    const { invalidateByExactMatch, invalidateByPatternMatch } = useRevalidate()

    const { remove, isPending } = useRequest()

    const handleDelete = () => {
        remove(path, undefined, {
            onSuccess: () => {
                toast.success("Successfully")
                onSuccessAction?.()
                if (invalidateByExactKeys) {
                    invalidateByExactMatch(invalidateByExactKeys)
                }
                if (invalidateByPatternKeys) {
                    invalidateByPatternMatch(invalidateByPatternKeys)
                }
                closeModal()
            },
        })
    }

    return (
        <Modal modalKey={modalKey} className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="font-normal">
                    Are you really want to delete?
                    {": "}
                    <b>{name}</b>
                </DialogTitle>
                <DialogDescription>
                    This action cannot be undone!
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <Button
                    variant={"outline"}
                    disabled={isPending}
                    onClick={closeModal}
                >
                    Back
                </Button>
                <Button
                    variant={"destructive"}
                    onClick={handleDelete}
                    isLoading={isPending}
                >
                    Delete
                </Button>
            </DialogFooter>
        </Modal>
    )
}
