"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  DollarSign,
  ExternalLink,
  Trash2,
  Edit,
  User,
  Hash,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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

const statusColors = {
  active: "success" as const,
  "in-revision": "warning" as const,
  completed: "secondary" as const,
  cancelled: "destructive" as const,
}

const statuses = ["active", "in-revision", "completed", "cancelled"]

interface ProjectCardProps {
  project: Project
  onUpdate?: (project: Project) => void
  onDelete?: (id: string) => void
}

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [notes, setNotes] = useState(project.notes || "")
  const [status, setStatus] = useState(project.status)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function handleUpdate() {
    setSaving(true)
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, notes, status }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onUpdate?.(data.data)
      toast({ title: "Project updated" })
      setShowModal(false)
    } catch {
      toast({ title: "Update failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const isOverdue =
    project.deadline &&
    new Date(project.deadline) < new Date() &&
    project.status === "active"

  return (
    <>
      <Card
        className="cursor-pointer hover:border-primary/20 transition-all"
        onClick={() => setShowModal(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <Badge variant={statusColors[project.status as keyof typeof statusColors] || "secondary"} className="text-xs capitalize">
                {project.status}
              </Badge>
              <h3 className="font-medium text-sm leading-snug">{project.title}</h3>
            </div>
            {project.budget && (
              <div className="flex items-center gap-1 text-sm font-semibold text-green-500 shrink-0">
                <DollarSign className="h-3.5 w-3.5" />
                {project.budget}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {project.buyer_name}
          </div>

          {project.deadline && (
            <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? "OVERDUE - " : "Due "}
              {formatDate(project.deadline)}
            </div>
          )}

          {project.order_id && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              {project.order_id}
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg w-full mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{project.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Project details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Buyer</p>
                <p className="font-medium">{project.buyer_name}</p>
              </div>
              {project.budget && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium text-green-500">${project.budget}</p>
                </div>
              )}
              {project.deadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                  <p className={`font-medium ${isOverdue ? "text-red-400" : ""}`}>{formatDate(project.deadline)}</p>
                </div>
              )}
              {project.order_id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono text-xs">{project.order_id}</p>
                </div>
              )}
            </div>

            {project.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground/80">{project.description}</p>
              </div>
            )}

            {project.platform_link && (
              <a
                href={project.platform_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View on Fiverr
              </a>
            )}

            {/* Status update */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this project..."
                className="min-h-[120px] bg-background text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between">
            {onDelete && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setShowModal(false)
                  onDelete(project.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving}>
                <Edit className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
