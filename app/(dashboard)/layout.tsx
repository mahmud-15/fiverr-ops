import { Sidebar } from "@/components/layout/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { HeaderRight } from "@/components/layout/header-right"
import { ThemeToggle } from "@/components/theme-toggle"
import { NewsTicker } from "@/components/layout/news-ticker"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 glass px-4 lg:px-6 shrink-0 transition-colors duration-200">
          {/* Mobile spacer (hamburger is fixed-positioned) */}
          <div className="w-8 shrink-0 lg:hidden" />
          {/* Breaking news ticker */}
          <NewsTicker />
          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <ThemeToggle />
            <HeaderRight />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
