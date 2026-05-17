import { ProfileAuditor } from "@/components/profile/profile-auditor"
import { AuditHistory } from "@/components/profile/audit-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, History } from "lucide-react"

export default function ProfileAuditorPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-md glow-primary">
          <BarChart2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Profile Auditor</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Get an AI-powered audit of your Fiverr profile with actionable improvement recommendations
          </p>
        </div>
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <ProfileAuditor />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
