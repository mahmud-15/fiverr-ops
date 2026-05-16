"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplianceRulesManager } from "./compliance-rules-manager"
import { AppConfig } from "./app-config"

export function Settings() {
  return (
    <Tabs defaultValue="rules">
      <TabsList>
        <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
        <TabsTrigger value="config">App Config</TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="mt-6">
        <ComplianceRulesManager />
      </TabsContent>

      <TabsContent value="config" className="mt-6">
        <AppConfig />
      </TabsContent>
    </Tabs>
  )
}
