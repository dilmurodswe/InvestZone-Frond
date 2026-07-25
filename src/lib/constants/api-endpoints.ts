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
            EXTRA_FIELD_VALUES: "/extra/raw-materials/extra-field-values",
        },
        RAW_EXTRA_FIELDS: {
            INDEX: "extra/row-extra-fields",
        },
        EXTRA_FIELDS: {
            INDEX: "extra/extra-fields",
        },
    },
    SETTINGS: {
        MACHINE: {
            INDEX: "extra/machines",
            ID: { INDEX: "extra/machines/{id}" },
        },
        CURRENCY: {
            INDEX: "extra/currency",
            ID: { INDEX: "extra/currency/{id}" },
        },
        PAYMENT_TYPE: {
            INDEX: "extra/payment-type",
            ID: { INDEX: "extra/payment-type/{id}" },
        },
        WAREHOUSE: {
            INDEX: "extra/warehouses",
            ID: { INDEX: "extra/warehouses/{id}" },
        },
    },
    ORDERS: {
        INDEX: "orders",
        ID: {
            INDEX: "orders/{id}",
            CREATE_DEMAND: "orders/{id}/create-demand",
        },
        // Xomashyo so'rovlaridagi `request-files` bilan bir xil sxema:
        // fayl `common/uploads` ga yuklanadi, keyin hujjatga bog'lanadi.
        FILES: {
            INDEX: "orders/order-files/{id}",
            POST: "orders/order-files",
            DELETE: "orders/order-files/delete/{id}",
        },
    },
    DEMANDS: {
        INDEX: "demands",
        ID: { INDEX: "demands/{id}" },
        FILES: {
            INDEX: "demands/demand-files/{id}",
            POST: "demands/demand-files",
            DELETE: "demands/demand-files/delete/{id}",
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
        ITEM_DETAIL: {
            INDEX: "raw-material/item-detail",
            BY_ROW: "raw-material/item-detail/by-row/{id}",
            ID: "raw-material/item-detail/{id}",
        },
    },
    RAW_MATERIAL_ITEMS: {
        INDEX: "raw-material/requests/list",
    },
    COMMON: {
        UPLOADS: { INDEX: "common/uploads" },
    },
    TASK_MANAGER: {
        PROJECTS: {
            INDEX: "projects",
            ID: { INDEX: "projects/{id}" },
        },
        PROJECT_TASKS: {
            INDEX: "projects/project-tasks/{id}",
        },
        STATUSES: {
            INDEX: "statuses",
            ID: "statuses/{id}",
        },
        TASKS: {
            INDEX: "tasks",
            ID: "tasks/{id}",
        },
    },
    RAW_MATERIALS: {
        INDEX: "raw-material",
        THICKNESSES: "raw-material/thicknesses",
        WIDTHS: "raw-material/widths",
    },
    MANUFACTURES: {
        INDEX: "manufactures",
        ID: "manufactures/{id}",
        READY_PRODUCTS: "manufactures/ready-products",
        CALCULATE_AMOUNT: "manufactures/calculate-amount",
        READY_STRIPS: "manufactures/ready-strips",
        STRIP_BATCHES: "manufactures/strip-batches",
    },
    FINANCE: {
        EXPENSE: {
            INDEX: "finance/expence",
            ID: { INDEX: "finance/expence/{id}" },
        },
        INCOME: {
            INDEX: "finance/income",
            ID: { INDEX: "finance/income/{id}" },
        },
    },
    DASHBOARD: {
        EXPENSE_STATS: "dashboard/expense-stats",
        INCOME_STATS: "dashboard/income-stats",
        PAYMENT_TYPE_STATS: "dashboard/payment-type-stats",
    },
    ROLLING_PLANS: {
        INDEX: "rolling-plans",
        ID: "rolling-plans/{id}",
    },
} as const
