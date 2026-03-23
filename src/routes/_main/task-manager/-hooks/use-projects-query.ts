import { useGet } from "@/hooks/react-query/use-get"
import { API } from "@/lib/constants/api-endpoints"
import { getArray } from "@/lib/utils/get-array"
import type { Project } from "../-types"

export const useProjectsQuery = () => {
    const res = useGet<Project[]>(API.TASK_MANAGER.PROJECTS.INDEX)
    const projectList = getArray(res.data)

    return { ...res, projectList }
}
