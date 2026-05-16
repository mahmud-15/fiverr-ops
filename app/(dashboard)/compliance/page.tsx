import { ComplianceChecker } from "@/components/compliance/compliance-checker"
import { ComplianceHistoryList } from "@/components/compliance/history-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, History, Info } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance Checker</h1>
        <p className="text-muted-foreground mt-1">
          Check your Fiverr messages and conversations for policy violations before sending
        </p>
      </div>

      {/* Info bar */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">How it works:</span> Content is scanned by both a rule-based engine (instant, no cost) and Claude AI (deeper contextual analysis). Results are merged and deduplicated.
        </div>
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
