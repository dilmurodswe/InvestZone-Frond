import { create } from "zustand"
import type { PaymentType } from "../-types"

interface State {
    paymentType: PaymentType | null
}
interface Actions {
    setPaymentType: (paymentType: PaymentType | null) => void
}

export const usePaymentTypeStore = create<State & Actions>((set) => ({
    paymentType: null,
    setPaymentType: (paymentType) => set({ paymentType }),
}))
