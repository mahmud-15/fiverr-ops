"use client"

import { usePathname } from "next/navigation"
import { navItems } from "./nav-items"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const currentPage = navItems.find((item) => item.href === pathname)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <h1 className="text-lg font-semibold text-foreground">
        {currentPage?.title || "Syndio"}
      </h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
