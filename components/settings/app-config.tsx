"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Key, Database, Brain, Rss, Globe } from "lucide-react"

interface ConfigItem {
  label: string
  envKey: string
  description: string
  required: boolean
}

const CONFIG_SECTIONS: { title: string; icon: React.ElementType; items: ConfigItem[] }[] = [
  {
    title: "Database",
    icon: Database,
    items: [
      { label: "Spreadsheet ID", envKey: "GOOGLE_SPREADSHEET_ID", description: "Google Sheets spreadsheet ID from the URL", required: true },
      { label: "Service Account Email", envKey: "GOOGLE_SERVICE_ACCOUNT_EMAIL", description: "Google Cloud service account email", required: true },
      { label: "Private Key", envKey: "GOOGLE_PRIVATE_KEY", description: "Google Cloud service account private key", required: true },
    ],
  },
  {
    title: "AI Engine",
    icon: Brain,
    items: [
      { label: "Anthropic API Key", envKey: "ANTHROPIC_API_KEY", description: "Powers compliance checking, profile auditing, brief analysis", required: true },
    ],
  },
  {
    title: "Intelligence Feed",
    icon: Rss,
    items: [
      { label: "Tavily API Key", envKey: "TAVILY_API_KEY", description: "Web search for Fiverr news and updates", required: false },
    ],
  },
  {
    title: "Profile Scraping",
    icon: Globe,
    items: [
      { label: "ScrapingBee API Key", envKey: "SCRAPINGBEE_API_KEY", description: "Fiverr profile scraping with rotating IPs", required: false },
    ],
  },
  {
    title: "Notifications",
    icon: Key,
    items: [
      { label: "Resend API Key", envKey: "RESEND_API_KEY", description: "Email notifications for urgent feed items", required: false },
    ],
  },
]

export function AppConfig() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
        <p className="text-sm text-yellow-200 font-medium">API Keys are server-side only</p>
        <p className="text-xs text-muted-foreground mt-1">
          Keys are stored in <code className="font-mono bg-secondary px-1 rounded">.env.local</code> on your server and never exposed to the browser.
          To update a key, edit the file and restart the dev server.
        </p>
      </div>

      {CONFIG_SECTIONS.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item.envKey} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <code className="text-xs text-muted-foreground font-mono">{item.envKey}</code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.required ? "destructive" : "secondary"} className="text-xs">
                      {item.required ? "required" : "optional"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Retention Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            All conversation data, PDFs, and screenshots uploaded for compliance checks are stored in your personal Google Sheet.
            You control data retention — delete rows directly from the spreadsheet or build a cleanup job using the Sheets API.
          </p>
          <p className="text-xs text-muted-foreground">
            Recommended: archive or delete compliance checks older than 90 days to protect client privacy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
