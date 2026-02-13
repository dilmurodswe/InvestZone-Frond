import resources from "./resources"

declare module "i18next" {
    interface CustomTypeOptions {
        resources: (typeof resources)["en"] // This ensures proper typing
        returnNull: false // Uncomment this if you get DefaultTFuncReturn errors
    }
}
