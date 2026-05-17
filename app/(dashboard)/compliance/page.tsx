import { ComplianceChecker } from "@/components/compliance/compliance-checker"
import { ComplianceHistoryList } from "@/components/compliance/history-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, History } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md glow-primary">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Compliance Checker</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Check your Fiverr messages and conversations for policy violations before sending
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex gap-3 flex-wrap">
          {[
            { step: "1", label: "Paste text" },
            { step: "2", label: "AI scans" },
            { step: "3", label: "Get results" },
          ].map(({ step, label }, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                {step}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
              {i < 2 && <span className="text-muted-foreground/40 hidden sm:inline">→</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground sm:ml-auto max-w-xs">
          Scanned by rule-based engine + Claude AI for deeper contextual analysis.
        </p>
      </div>

      <Tabs defaultValue="checker">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="checker" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Checker
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checker" className="mt-6">
          <ComplianceChecker />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceHistoryList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
