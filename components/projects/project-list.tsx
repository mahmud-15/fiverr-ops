"use client"

import { useState, useEffect } from "react"
import { ProjectCard } from "./project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FolderKanban } from "lucide-react"

interface Project {
  id: string
  buyer_name: string
  title: string
  status: string
  budget?: number
  deadline?: string
  description?: string
  notes?: string
  order_id?: string
  platform_link?: string
  tags: string[]
  created_at: string
  updated_at: string
}

const statusColumns = [
  { key: "active", label: "Active", color: "text-green-500" },
  { key: "in-revision", label: "In Revision", color: "text-yellow-500" },
  { key: "completed", label: "Completed", color: "text-muted-foreground" },
  { key: "cancelled", label: "Cancelled", color: "text-red-500" },
]

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"kanban" | "list">("list")
  const [form, setForm] = useState({
    buyer_name: "", title: "", status: "active", budget: "",
    deadline: "", description: "", order_id: "", platform_link: "", tags: ""
  })
  const { toast } = useToast()

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  async function handleAddProject() {
    if (!form.buyer_name || !form.title) {
      toast({ title: "Buyer name and title required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseFloat(form.budget) : null,
          deadline: form.deadline || null,
          tags,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Project added!" })
      setShowAddDialog(false)
      setForm({ buyer_name: "", title: "", status: "active", budget: "", deadline: "", description: "", order_id: "", platform_link: "", tags: "" })
      await fetchProjects()
    } catch {
      toast({ title: "Failed to add project", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = (updated: Project) => {
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" })
      setProjects((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Project deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  const projectsByStatus = statusColumns.reduce((acc, col) => {
    acc[col.key] = projects.filter((p) => p.status === col.key)
    return acc
  }, {} as Record<string, Project[]>)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Track your first Fiverr project</p>
        </div>
      ) : view === "list" ? (
        /* List view */
        <div className="space-y-6">
          {statusColumns.map((col) => {
            const colProjects = projectsByStatus[col.key]
            if (colProjects.length === 0) return null
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{colProjects.length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {colProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Kanban view */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {statusColumns.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{projectsByStatus[col.key].length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px] rounded-lg bg-secondary/20 p-3">
                {projectsByStatus[col.key].map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buyer Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={form.buyer_name}
                  onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusColumns.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project Title *</Label>
              <Input
                placeholder="e.g., Build React dashboard for SaaS app"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief project description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[100px] bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  placeholder="FO..."
                  value={form.order_id}
                  onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="react, frontend, urgent"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fiverr Order Link</Label>
              <Input
                placeholder="https://www.fiverr.com/orders/..."
                value={form.platform_link}
                onChange={(e) => setForm({ ...form, platform_link: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProject} disabled={saving}>
              {saving ? "Saving..." : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
