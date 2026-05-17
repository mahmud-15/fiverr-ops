import { Settings } from "@/components/settings/settings"

export default function SettingsPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage compliance rules, app configuration, and data policies
        </p>
      </div>
      <Settings />
    </div>
  )
}
