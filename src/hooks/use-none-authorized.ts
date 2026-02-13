import { useProfileQuery } from "./react-query/use-profile-query"
import { useLastPage } from "./use-last-page"
import { useLoginModal } from "./use-login-modal"

export function useNoneAuthorized() {
    const { setLastPage } = useLastPage()
    const { openLoginModal } = useLoginModal()
    const { isAuthenticated } = useProfileQuery()

    const redirectToSignIn = (action?: () => void) => {
        if (!isAuthenticated) {
            openLoginModal()
            setLastPage()
        } else {
            action?.()
        }
    }

    return { redirectToSignIn }
}
