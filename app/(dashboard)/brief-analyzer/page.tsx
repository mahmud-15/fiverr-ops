import { BriefAnalyzer } from "@/components/brief/brief-analyzer"

export default function BriefAnalyzerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brief Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Paste a client brief to extract requirements, identify risks, and get pricing recommendations
        </p>
      </div>

      <BriefAnalyzer />
    </div>
  )
}
