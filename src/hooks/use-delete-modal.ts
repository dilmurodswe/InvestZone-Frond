import { useModalContext } from "@/providers/modal-provider"

export const useDeleteModal = (key = "delete") => {
    const { modals, openModal, closeModal } = useModalContext()
    return {
        isOpenDelete: modals[key],
        openDeleteModal: () => openModal(key),
        closeDeleteModal: () => closeModal(key),
    }
}
