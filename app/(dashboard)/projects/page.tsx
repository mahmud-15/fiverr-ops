import { ProjectList } from "@/components/projects/project-list"
import { FolderKanban } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-md" style={{ boxShadow: "0 0 20px hsl(45 93% 47% / 0.25)" }}>
          <FolderKanban className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Projects</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Track your active Fiverr orders and project status
          </p>
        </div>
      </div>

      <ProjectList />
    </div>
  )
}
