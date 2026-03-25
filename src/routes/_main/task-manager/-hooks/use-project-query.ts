import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import type { Project } from "../-types"

export const useProjectQuery = (projectId: number) => {
    const res = useGet<Project>(
        API.TASK_MANAGER.PROJECTS.ID.INDEX.replace("{id}", String(projectId)),
    )
    return { ...res, project: res.data }
}
