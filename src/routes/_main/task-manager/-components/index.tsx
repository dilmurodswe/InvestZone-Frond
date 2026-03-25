import Layout from "@/components/layouts/layout"
import Navbar from "@/components/navbar"
import NoData from "@/components/no-data/nodata"
import Group from "@/components/semantic/group"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { Loader2, PlusIcon } from "lucide-react"
import { useProjectStore } from "../-hooks/use-project-store"
import { useProjectsQuery } from "../-hooks/use-projects-query"
import ProjectAddEditModal from "./project-add-edit-modal"
import ProjectCard from "./project-card"
import ProjectDeleteModal from "./project-delete-modal"

export default function Index() {
    const { projectList, isFetching } = useProjectsQuery()
    const { setProject } = useProjectStore()
    const addModal = useModal("add-project")

    return (
        <>
            <Navbar links={[{ label: "Task Manager" }]} />
            <Layout>
                <Group className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-700">
                        Projects
                    </h2>
                    <Button
                        onClick={() => {
                            setProject(null)
                            addModal.openModal()
                        }}
                    >
                        <PlusIcon />
                        Create Project
                    </Button>
                </Group>

                {isFetching && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                )}

                {!isFetching && projectList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {projectList.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}

                {!isFetching && projectList.length === 0 && (
                    <NoData>
                        <Button
                            onClick={() => {
                                setProject(null)
                                addModal.openModal()
                            }}
                            variant="ghost"
                            className="text-primary"
                        >
                            <PlusIcon />
                            Create your first project
                        </Button>
                    </NoData>
                )}

                <ProjectAddEditModal />
                <ProjectDeleteModal />
            </Layout>
        </>
    )
}
