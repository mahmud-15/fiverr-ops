"use client"

import { useState, useEffect } from "react"
import { KbSearch } from "@/components/knowledge-base/kb-search"
import { KbArticle } from "@/components/knowledge-base/kb-article"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BookOpen, Bot } from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  source?: string
  created_at: string
}

const categories = ["Policies", "SOPs", "Pricing", "Lessons Learned"]

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", content: "", category: "", tags: "", source: "" })
  const { toast } = useToast()

  async function fetchArticles(category?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category && category !== "all") params.set("category", category)
      const res = await fetch(`/api/knowledge-base?${params}`)
      const data = await res.json()
      setArticles(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(activeCategory)
  }, [activeCategory])

  function handleSearchResults(resultArticles: unknown[], answer: string) {
    setArticles(resultArticles as Article[])
    setSearchAnswer(answer)
  }

  async function handleAddArticle() {
    if (!form.title || !form.content) {
      toast({ title: "Title and content required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Article added!" })
      setShowAddDialog(false)
      setForm({ title: "", content: "", category: "", tags: "", source: "" })
      await fetchArticles(activeCategory)
    } catch {
      toast({ title: "Failed to add article", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return
    try {
      await fetch(`/api/knowledge-base?id=${id}`, { method: "DELETE" })
      setArticles((prev) => prev.filter((a) => a.id !== id))
      toast({ title: "Article deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Your personal Fiverr knowledge repository with AI-powered search
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Article
        </Button>
      </div>

      {/* AI Search */}
      <div className="space-y-3">
        <KbSearch onResults={handleSearchResults} />
        {searchAnswer && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary mb-1">AI Answer</p>
                <p className="text-sm text-foreground/90">{searchAnswer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => { setActiveCategory("all"); setSearchAnswer(null) }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchAnswer(null) }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium">No articles yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Add your first knowledge base article</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <KbArticle key={article.id} article={article} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Knowledge Base Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Article title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                placeholder="Write the article content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[200px] bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g., policy, tos, tips"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Source URL (optional)</Label>
              <Input
                placeholder="https://..."
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddArticle} disabled={saving}>
              {saving ? "Saving..." : "Add Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
