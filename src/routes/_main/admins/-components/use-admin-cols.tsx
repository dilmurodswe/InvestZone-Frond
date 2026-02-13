import Phone from "@/components/custom/phone"
import { Badge } from "@/components/ui/badge"
import { dateTimeColumn } from "@/lib/utils/common-cell-renderers"
import type { ColumnDef } from "@tanstack/react-table"
import type { Admin } from "../-types"

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const useAdminCols = (): ColumnDef<Admin>[] => {
    return [
        {
            accessorKey: "phone_number",
            header: "Admin",
            cell: ({ row: { original } }) => {
                return (
                    <div className="text-sm">
                        <p className="font-medium">
                            {original.first_name} {original.last_name}
                        </p>
                        <Phone
                            value={original.phone_number}
                            className="text-muted-foreground"
                        />
                    </div>
                )
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row: { original } }) => {
                return (
                    <Badge
                        variant={"secondary"}
                        className="capitalize font-semibold text-xs"
                    >
                        {original.role}
                    </Badge>
                )
            },
        },
        dateTimeColumn("date_joined", "Joined at"),
        // {
        //     accessorKey: "id",
        //     header: "Status",
        //     cell: () => {
        //         return (
        //             <Badge
        //                 variant={"success"}
        //                 className="capitalize font-semibold text-xs"
        //             >
        //                 Active
        //             </Badge>
        //         )
        //     },
        // },
    ]
}
