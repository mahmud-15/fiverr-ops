import {
  LayoutDashboard,
  ShieldCheck,
  BarChart2,
  Rss,
  FileSearch,
  Library,
  BookOpen,
  FolderKanban,
  Settings,
} from "lucide-react"

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Compliance Checker",
    href: "/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Profile Auditor",
    href: "/profile-auditor",
    icon: BarChart2,
  },
  {
    title: "Intelligence Feed",
    href: "/feed",
    icon: Rss,
  },
  {
    title: "Brief Analyzer",
    href: "/brief-analyzer",
    icon: FileSearch,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: Library,
  },
  {
    title: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]
