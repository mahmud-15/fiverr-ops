import { TemplateLibrary } from "@/components/templates/template-library"
import { Library, ShieldCheck } from "lucide-react"

export default function TemplatesPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md" style={{ boxShadow: "0 0 20px hsl(330 81% 60% / 0.25)" }}>
          <Library className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Message Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pre-written, compliance-checked templates for every Fiverr scenario
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">All templates are compliance-checked</span>
          </div>
        </div>
      </div>
      <TemplateLibrary />
    </div>
  )
}
