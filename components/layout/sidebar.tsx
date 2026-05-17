"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { navItems } from "./nav-items"
import { Zap, LogOut, User, X, Menu } from "lucide-react"

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="flex h-full flex-col border-r border-border transition-colors duration-200" style={{ background: "hsl(var(--sidebar, var(--card)))" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow-md glow-primary shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">Syndio</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const delayClass =
              index === 0 ? "delay-75" :
              index === 1 ? "delay-100" :
              index === 2 ? "delay-150" :
              index === 3 ? "delay-200" :
              index === 4 ? "delay-300" :
              index === 5 ? "delay-400" : "delay-500"
            return (
              <li key={item.href} className={cn("animate-slide-in-left opacity-0", delayClass)}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  {/* Active left border indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User area */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex items-center gap-3 px-1">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 ring-2 ring-primary/20 text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card animate-pulse-dot" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Mahmud</p>
            <p className="text-xs text-muted-foreground truncate">Fiverr Seller</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Mobile hamburger button */}
      <button
        id="mobile-menu-btn"
        className="lg:hidden fixed top-3.5 left-4 z-30 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}
