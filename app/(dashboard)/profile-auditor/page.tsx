import { ProfileAuditor } from "@/components/profile/profile-auditor"
import { AuditHistory } from "@/components/profile/audit-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, History } from "lucide-react"

export default function ProfileAuditorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Auditor</h1>
        <p className="text-muted-foreground mt-1">
          Get an AI-powered audit of your Fiverr profile with actionable improvement recommendations
        </p>
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
