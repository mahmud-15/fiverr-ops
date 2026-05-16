import { TemplateLibrary } from "@/components/templates/template-library"

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Message Templates</h1>
        <p className="text-muted-foreground mt-1">
          Pre-written, compliance-checked templates for common Fiverr scenarios
        </p>
      </div>

      <TemplateLibrary />
    </div>
  )
}
