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
            INDEX: "client/users",
            ID: { INDEX: "client/users/{id}" },
        },
    },
} as const
