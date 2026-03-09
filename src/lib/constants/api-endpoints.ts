export const API = {
    AUTH: {
        LOGIN: {
            INDEX: "auth/login",
        },
        REFRESH: {
            INDEX: "auth/refresh",
        },
        VERIFY: {
            INDEX: "auth/verify",
        },
        ME: {
            INDEX: "auth/me",
        },
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
} as const
