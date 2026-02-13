import { useLocation } from "@tanstack/react-router"
import { useLastPagePersist } from "./store/use-last-page-persist"

export const useLastPage = () => {
    const { pathname } = useLocation()
    const { setLastPageState } = useLastPagePersist()

    function setLastPage() {
        setLastPageState({ lastPage: pathname })
    }
    return { setLastPage }
}
