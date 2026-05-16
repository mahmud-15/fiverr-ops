import { Settings } from "@/components/settings/settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage compliance rules, app configuration, and data policies
        </p>
      </div>
      <Settings />
    </div>
  )
}
