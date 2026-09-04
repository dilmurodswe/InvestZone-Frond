import { create } from "zustand"

/**
 * Carries an order id from the order-detail modal ("Kirimga o'tkazish" button)
 * into the "Add income" form so it opens with that order — and therefore its
 * client, amount and currency — already filled in. Cleared when income is
 * added from the income page itself.
 */
interface State {
    orderId: number | null
    setOrderId: (id: number | null) => void
}

export const useIncomePrefillStore = create<State>((set) => ({
    orderId: null,
    setOrderId: (orderId) => set({ orderId }),
}))
