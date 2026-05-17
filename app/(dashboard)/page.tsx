import Link from "next/link"
import { complianceChecks, profileAudits, feedItems, projects } from "@/lib/sheets/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GreetingClock } from "@/components/dashboard/greeting-clock"
import {
  ShieldCheck,
  BarChart2,
  Rss,
  FileSearch,
  Library,
  BookOpen,
  FolderKanban,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

async function getDashboardStats() {
  const [allChecks, allAudits, allFeed, allProjects] = await Promise.all([
    complianceChecks.getAll(),
    profileAudits.getAll(),
    feedItems.getAll(),
    projects.getAll(),
  ])

  const checksCount = allChecks.length

  const sortedAudits = allAudits.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const latestScore = sortedAudits[0]?.overall_score ?? null

  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const feedCount = allFeed.filter((i) => i.created_at >= yesterday).length

  const projectsCount = allProjects.filter((p) => p.status === "active").length

  const recentChecks = allChecks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      created_at: c.created_at,
      verdict: c.verdict,
      issues_count: Number(c.issues_count) || 0,
    }))

  const recentProjects = allProjects
    .filter((p) => p.status === "active")
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      buyer_name: p.buyer_name,
      title: p.title,
      status: p.status,
      deadline: p.deadline,
    }))

  return {
    checksCount,
    latestScore,
    feedCount,
    projectsCount,
    recentChecks,
    recentProjects,
  }
}

function getVerdictIcon(verdict: string) {
  if (verdict === "SAFE") return <CheckCircle className="h-4 w-4 text-green-500" />
  if (verdict === "UNSAFE") return <XCircle className="h-4 w-4 text-red-500" />
  return <AlertTriangle className="h-4 w-4 text-yellow-500" />
}

function getVerdictBadge(verdict: string) {
  if (verdict === "SAFE") return <Badge variant="success">Safe</Badge>
  if (verdict === "UNSAFE") return <Badge variant="destructive">Unsafe</Badge>
  return <Badge variant="warning">Review</Badge>
}

const quickActions = [
  { title: "Check Compliance", href: "/compliance", icon: ShieldCheck, color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "Audit Profile", href: "/profile-auditor", icon: BarChart2, color: "text-purple-400", bg: "bg-purple-400/10" },
  { title: "Intelligence Feed", href: "/feed", icon: Rss, color: "text-green-400", bg: "bg-green-400/10" },
  { title: "Analyze Brief", href: "/brief-analyzer", icon: FileSearch, color: "text-orange-400", bg: "bg-orange-400/10" },
  { title: "Templates", href: "/templates", icon: Library, color: "text-pink-400", bg: "bg-pink-400/10" },
  { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { title: "Projects", href: "/projects", icon: FolderKanban, color: "text-yellow-400", bg: "bg-yellow-400/10" },
]

const statCards = [
  {
    title: "Total Checks",
    icon: ShieldCheck,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    delay: "delay-75",
  },
  {
    title: "Profile Score",
    icon: BarChart2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/10",
    delay: "delay-150",
  },
  {
    title: "Feed Today",
    icon: Rss,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10",
    delay: "delay-200",
  },
  {
    title: "Active Projects",
    icon: FolderKanban,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10",
    delay: "delay-300",
  },
]

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statValues = [
    { value: stats.checksCount, sub: "Compliance checks run" },
    {
      value: stats.latestScore !== null ? `${stats.latestScore}` : "—",
      sub: stats.latestScore !== null ? "Latest audit score" : "No audit yet",
    },
    { value: stats.feedCount, sub: "New items in last 24h" },
    { value: stats.projectsCount, sub: "In progress" },
  ]

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          <GreetingClock />
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Here&apos;s your Fiverr operations overview
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => {
          const Icon = s.icon
          const sv = statValues[i]
          return (
            <Card key={s.title} className={`card-hover animate-fade-in-up opacity-0 ${s.delay}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <Icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{sv.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sv.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <Card className="animate-fade-in-up opacity-0 delay-300">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              const delayClass = ["delay-75","delay-100","delay-150","delay-200","delay-300","delay-400","delay-500"][i] ?? ""
              return (
                <Link key={action.href} href={action.href}>
                  <div className={`card-hover animate-fade-in-up opacity-0 ${delayClass} flex flex-col items-center gap-2.5 rounded-xl p-3.5 ${action.bg} hover:opacity-90 transition-opacity cursor-pointer`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-xs text-center font-medium text-foreground leading-tight">{action.title}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent compliance checks */}
        <Card className="card-hover animate-fade-in-up opacity-0 delay-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Compliance Checks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/compliance" className="flex items-center gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentChecks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No checks yet. Run your first compliance check.</p>
            ) : (
              stats.recentChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {getVerdictIcon(check.verdict)}
                    <div>
                      <div className="text-sm font-medium">{getVerdictBadge(check.verdict)}</div>
                      <p className="text-xs text-muted-foreground">
                        {check.issues_count} issue{check.issues_count !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(check.created_at)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active projects */}
        <Card className="card-hover animate-fade-in-up opacity-0 delay-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects" className="flex items-center gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active projects. Add your first project.</p>
            ) : (
              stats.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">by {project.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    {project.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Due {formatDateTime(project.deadline)}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-1">Active</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
