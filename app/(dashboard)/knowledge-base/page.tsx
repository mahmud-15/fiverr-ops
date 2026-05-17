"use client"

import { useState, useEffect, useRef } from "react"
import { KbSearch } from "@/components/knowledge-base/kb-search"
import { KbArticle } from "@/components/knowledge-base/kb-article"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, BookOpen, Bot, Upload, Loader2, FileText, RefreshCw, DollarSign,
} from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  source?: string
  created_at: string
}

interface PricingData {
  projectType: string
  priceMin: number
  priceMax: number
  timeline: string
  complexity: string
}

const categories = ["Policy", "Quotation", "Conversation", "Pricing", "SOPs", "Reference", "Lessons Learned"]

const categoryColors: Record<string, string> = {
  "Policy": "bg-red-500/10 text-red-500 border-red-500/30",
  "Quotation": "bg-green-500/10 text-green-500 border-green-500/30",
  "Conversation": "bg-blue-500/10 text-blue-500 border-blue-500/30",
  "Pricing": "bg-amber-500/10 text-amber-500 border-amber-500/30",
  "SOPs": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Reference": "bg-purple-500/10 text-purple-500 border-purple-500/30",
  "Lessons Learned": "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", content: "", category: "", tags: "", source: "" })
  const { toast } = useToast()

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadText, setUploadText] = useState("")
  const [uploadFileType, setUploadFileType] = useState("text")
  const [uploading, setUploading] = useState(false)
  const [uploadInsights, setUploadInsights] = useState<string[] | null>(null)
  const [uploadPricing, setUploadPricing] = useState<PricingData | null>(null)
  const [uploadedArticleId, setUploadedArticleId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Policy learning state
  const [learningPolicies, setLearningPolicies] = useState(false)

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

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setUploadFile(dropped)
  }

  async function handleUpload() {
    if (!uploadFile && !uploadText.trim()) {
      toast({ title: "Provide a file or paste text", variant: "destructive" })
      return
    }
    setUploading(true)
    setUploadInsights(null)
    setUploadPricing(null)
    setUploadedArticleId(null)
    try {
      const fd = new FormData()
      if (uploadFile) fd.append("file", uploadFile)
      if (uploadText.trim()) fd.append("text", uploadText.trim())
      fd.append("fileType", uploadFileType)

      const res = await fetch("/api/knowledge-base/upload", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Upload failed")

      setUploadInsights(data.insights || [])
      setUploadPricing(data.pricingData || null)
      setUploadedArticleId(data.article?.id || null)

      toast({ title: "File learned successfully!" })
      await fetchArticles(activeCategory)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      toast({ title: msg, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  async function handleLearnPolicies() {
    setLearningPolicies(true)
    try {
      const res = await fetch("/api/knowledge-base/learn-policies", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Policy learning failed")
      toast({
        title: `Policies updated: ${data.added} added, ${data.updated} updated`,
      })
      await fetchArticles(activeCategory)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to learn policies"
      toast({ title: msg, variant: "destructive" })
    } finally {
      setLearningPolicies(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Knowledge Base</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload files to teach the AI your pricing, conversations, and policies
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleLearnPolicies}
            disabled={learningPolicies}
            className="gap-2"
          >
            {learningPolicies ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            {learningPolicies ? "Fetching latest policies..." : "Learn Fiverr Policies"}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Article
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">All Articles</TabsTrigger>
          <TabsTrigger value="upload">Upload &amp; Learn</TabsTrigger>
          <TabsTrigger value="search">AI Search</TabsTrigger>
        </TabsList>

        {/* All Articles Tab */}
        <TabsContent value="articles" className="space-y-4 mt-4">
          {/* Category filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => { setActiveCategory("all"); setSearchAnswer(null) }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              All
            </button>
            {["Policy", "Quotation", "Conversation", "Pricing", "SOPs", "Reference", "Lessons Learned"].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearchAnswer(null) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : categoryColors[cat]
                      ? `${categoryColors[cat]} hover:opacity-80`
                      : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

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
        </TabsContent>

        {/* Upload & Learn Tab */}
        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload &amp; Learn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                {uploadFile ? (
                  <div>
                    <p className="text-sm font-medium">{uploadFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(uploadFile.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Drop PDF, image, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports PDF and image files</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR paste text</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Textarea
                placeholder="Paste a conversation, quotation, or policy text here..."
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="min-h-[120px] bg-background text-sm"
              />

              <div className="space-y-2">
                <Label>What is this?</Label>
                <Select value={uploadFileType} onValueChange={setUploadFileType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quotation">Quotation</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                    <SelectItem value="policy">Policy Text</SelectItem>
                    <SelectItem value="text">Reference / Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || (!uploadFile && !uploadText.trim())}
                className="w-full gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {uploading ? "Extracting knowledge..." : "Upload & Learn"}
              </Button>

              {/* Extracted insights */}
              {uploadInsights && uploadInsights.length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    AI Extracted:
                  </p>
                  <ul className="space-y-1">
                    {uploadInsights.map((insight, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                  {uploadedArticleId && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Article saved to knowledge base.
                    </p>
                  )}
                </div>
              )}

              {/* Pricing data */}
              {uploadPricing && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Pricing Data Extracted:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Project:</span>{" "}
                      <span className="font-medium">{uploadPricing.projectType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Range:</span>{" "}
                      <span className="font-medium">
                        ${uploadPricing.priceMin} – ${uploadPricing.priceMax}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeline:</span>{" "}
                      <span className="font-medium">{uploadPricing.timeline}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Complexity:</span>{" "}
                      <span className="font-medium">{uploadPricing.complexity}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Saved as a separate Pricing article.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Search Tab */}
        <TabsContent value="search" className="space-y-4 mt-4">
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
            {articles.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <KbArticle key={article.id} article={article} onDelete={handleDelete} />
                ))}
              </div>
            )}
            {articles.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="font-medium">Search the knowledge base</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask a question to find relevant articles
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add article dialog */}
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
