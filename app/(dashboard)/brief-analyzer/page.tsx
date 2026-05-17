import { BriefAnalyzer } from "@/components/brief/brief-analyzer"
import { FileSearch } from "lucide-react"

export default function BriefAnalyzerPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md" style={{ boxShadow: "0 0 20px hsl(25 95% 53% / 0.25)" }}>
          <FileSearch className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Brief Analyzer</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Paste a client brief to extract requirements, identify risks, and get pricing recommendations
          </p>
        </div>
      </div>

      <BriefAnalyzer />
    </div>
  )
}
