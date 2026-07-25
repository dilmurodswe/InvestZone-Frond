import { getRequest } from "@/lib/api/default-requests"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import { useInfiniteQuery } from "@tanstack/react-query"

/** One page of a picker — kept small so the menu opens instantly. */
const PAGE_SIZE = 10

/**
 * Pages a reference list into a select on demand: the first {@link PAGE_SIZE}
 * load at once, scrolling to the menu bottom pulls the next page, and a
 * non-empty `search` is sent to the server (`?search=`) instead of filtering
 * client-side. Nothing is front-loaded, so large catalogs stay cheap to open.
 */
export const usePaginatedSelect = <T>(url: string, search: string) => {
    const res = useInfiniteQuery({
        queryKey: [url, "select", search],
        queryFn: ({ pageParam }) =>
            getRequest(url, {
                params: {
                    page: pageParam,
                    page_size: PAGE_SIZE,
                    search: search || undefined,
                },
            }) as Promise<PaginatedResponse<T>>,
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) =>
            lastPage.next ? pages.length + 1 : undefined,
    })
    const items = (res.data?.pages ?? []).flatMap((p) =>
        getArray<T>(p.results),
    )
    return { ...res, items }
}
