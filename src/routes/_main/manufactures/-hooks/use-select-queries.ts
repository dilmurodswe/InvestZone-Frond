import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { PaginatedResponse } from "@/types/common"
import type { RawItemDetail } from "../-types"

// ── Category ──────────────────────────────────────────────────────────────────

type CategoryOption = { id: number; name: string }

export const useCategoriesSelectQuery = () => {
    const res = useGet<CategoryOption[]>(API.EXTRA.CATEGORIES.INDEX)
    const categoryOptions = getArray<CategoryOption>(res?.data)
    return { ...res, categoryOptions }
}

// ── SubCategory ───────────────────────────────────────────────────────────────

type SubCategoryOption = { id: number; name: string; category?: number }

export const useSubCategoriesSelectQuery = (categoryId?: number) => {
    const res = useGet<PaginatedResponse<SubCategoryOption>>(
        API.EXTRA.SUBCATEGORIES.INDEX,
        { params: categoryId ? { category: categoryId } : {} },
    )
    const subCategoryOptions = getArray<SubCategoryOption>(res.data?.results)
    return { ...res, subCategoryOptions }
}

// ── Product ───────────────────────────────────────────────────────────────────

type ProductOption = {
    id: number
    name: string
    sub_category?: number
}

export const useProductsSelectQuery = (subCategoryId?: number) => {
    const res = useGet<PaginatedResponse<ProductOption>>(
        API.EXTRA.PRODUCTS.INDEX,
        { params: subCategoryId ? { sub_category: subCategoryId } : {} },
    )
    const productOptions = getArray<ProductOption>(res.data?.results)
    return { ...res, productOptions }
}

// ── Raw Item Detail ───────────────────────────────────────────────────────────

export const useRawItemDetailsSelectQuery = () => {
    const res = useGet<{ count: number; results: RawItemDetail[] }>(
        API.RAW_MATERIALS.INDEX,
    )
    const rawItemDetailOptions = getArray<RawItemDetail>(res.data?.results)
    return { ...res, rawItemDetailOptions }
}
