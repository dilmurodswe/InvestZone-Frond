import { MODAL_KEYS } from "@/lib/constants/modal-keys"
import { useModal } from "./use-modal"

export const useLoginModal = () => {
    const { openModal, closeModal, isOpen } = useModal(MODAL_KEYS.LOGIN)
    return {
        openLoginModal: openModal,
        closeLoginModal: closeModal,
        isLoginOpen: isOpen,
    }
}
