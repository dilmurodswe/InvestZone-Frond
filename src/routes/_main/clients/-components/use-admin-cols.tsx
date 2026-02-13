import Phone from "@/components/custom/phone"
import { dateTimeColumn, moneyColumn } from "@/lib/utils/common-cell-renderers"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client } from "../-types"

// eslint-disable-next-line react-x/no-unnecessary-use-prefix
export const useClientCols = (): ColumnDef<Client>[] => {
    return [
        {
            accessorKey: "first_name",
            header: "Client",
            cell: ({ row: { original } }) => {
                return (
                    <div>
                        <p>
                            {original.first_name} {original.last_name}
                        </p>
                    </div>
                )
            },
        },
        {
            accessorKey: "id",
            header: "Client id",
            meta: {
                tdClassName: "text-center",
            },
        },
        {
            accessorKey: "phone_number",
            header: "Phone number",
            cell: ({ row: { original } }) => {
                return (
                    <Phone
                        value={original.phone_number}
                        className="text-foreground"
                    />
                )
            },
        },
        {
            accessorKey: "passport_id",
            header: "Passport series",
        },
        {
            accessorKey: "birth_date",
            header: "Birth date",
        },
        moneyColumn("balance"),
        dateTimeColumn("date_joined", "Joined at"),
    ]
}
