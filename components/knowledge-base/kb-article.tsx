"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Trash2, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Article {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  source?: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  "Policies": "bg-red-500/10 text-red-400 border-red-500/20",
  "Policy": "bg-red-500/10 text-red-400 border-red-500/20",
  "SOPs": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Pricing": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Lessons Learned": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Quotation": "bg-green-500/10 text-green-400 border-green-500/20",
  "Conversation": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Reference": "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

interface KbArticleProps {
  article: Article
  onDelete?: (id: string) => void
}

export function KbArticle({ article, onDelete }: KbArticleProps) {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const excerpt = article.content.slice(0, 200)
  const categoryStyle = article.category
    ? categoryColors[article.category] || "bg-secondary text-muted-foreground"
    : ""

  return (
    <>
      <Card className="hover:border-primary/20 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 flex-1 min-w-0">
              {article.category && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyle}`}>
                  {article.category}
                </span>
              )}
              <h3 className="font-medium text-sm leading-snug">{article.title}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground line-clamp-3">
            {excerpt}{article.content.length > 200 ? "..." : ""}
          </p>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatDate(article.created_at)}</span>
              {article.source && (
                <a href={article.source} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Source
                </a>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(article.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowModal(true)}>
                <BookOpen className="h-3 w-3" />
                Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="space-y-2">
              {article.category && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryStyle}`}>
                  {article.category}
                </span>
              )}
              <DialogTitle className="text-left">{article.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
              {article.content}
            </div>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
