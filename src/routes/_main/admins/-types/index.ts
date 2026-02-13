import type { Profile } from "@/types/profile"

export type Admin = Profile & {
    date_joined: string
}
