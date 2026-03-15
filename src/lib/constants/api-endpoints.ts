export const API = {
    AUTH: {
        LOGIN: { INDEX: "auth/login" },
        REFRESH: { INDEX: "auth/refresh" },
        VERIFY: { INDEX: "auth/verify" },
        ME: { INDEX: "auth/me" },
    },
    ADMIN: {
        INDEX: "admin",
        USERS: {
            INDEX: "admin/users",
            ID: { INDEX: "admin/users/{id}" },
        },
    },
    CLIENT: {
        INDEX: "client",
        USERS: {
            INDEX: "common/clients",
            ID: { INDEX: "common/clients/{id}" },
        },
    },
    SUPPLIER: {
        INDEX: "supplier",
        USERS: {
            INDEX: "common/suppliers",
            ID: { INDEX: "common/suppliers/{id}" },
        },
    },
    EXTRA: {
        CATEGORIES: {
            INDEX: "extra/categories",
            ID: { INDEX: "extra/categories/{id}" },
        },
        SUBCATEGORIES: {
            INDEX: "extra/subcategories",
            ID: { INDEX: "extra/subcategories/{id}" },
        },
        PRODUCTS: {
            INDEX: "extra/products",
            ID: { INDEX: "extra/products/{id}" },
        },
        RAW_MATERIALS: {
            INDEX: "extra/raw-materials",
            ID: { INDEX: "extra/raw-materials/{id}" },
        },
    },
    RAW_MATERIAL_REQUESTS: {
        INDEX: "raw-material/requests",
        ID: {
            INDEX: "raw-material/requests/{id}",
            PATCH: "raw-material/{id}/patch",
        },
        ITEMS: { INDEX: "raw-material/items" },
        ITEMS_ID: { INDEX: "raw-material/items/{id}" },
        REQUEST_ITEMS_ID: { INDEX: "raw-material/request-items/{id}" },
        REQUEST_FILES: {
            INDEX: "raw-material/request-files/{id}",
            POST: "raw-material/request-files",
            DELETE: "raw-material/request-files/delete/{id}",
        },
        ITEM_DETAIL: { INDEX: "raw-material/item-detail" },
    },
    RAW_MATERIAL_ITEMS: {
        INDEX: "raw-material/requests/list",
    },
    COMMON: {
        UPLOADS: { INDEX: "common/uploads" },
    },
} as const
