import { ProjectList } from "@/components/projects/project-list"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">
          Track your active Fiverr orders and project status
        </p>
      </div>

      <ProjectList />
    </div>
  )
}
