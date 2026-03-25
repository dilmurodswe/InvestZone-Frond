import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { KanbanStatus } from "../-types"

export const useProjectTasksQuery = (projectId: number) => {
    const res = useGet<KanbanStatus[]>(
        API.TASK_MANAGER.PROJECT_TASKS.INDEX.replace("{id}", String(projectId)),
    )
    const statusList = getArray(res.data)

    return { ...res, statusList }
}
