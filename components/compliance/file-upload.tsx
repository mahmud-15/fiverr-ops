"use client"

import { useCallback, useRef } from "react"
import { Upload, X, FileText, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFilesChange: (files: File[]) => void
  files: File[]
}

export function FileUploadZone({ onFilesChange, files }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const dropped = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "application/pdf" || f.type.startsWith("image/")
      )
      onFilesChange([...files, ...dropped])
    },
    [files, onFilesChange]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || [])
      onFilesChange([...files, ...selected])
      if (inputRef.current) inputRef.current.value = ""
    },
    [files, onFilesChange]
  )

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
          files.length > 0 ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF or image files (PNG, JPG, WebP)</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md bg-secondary p-2 text-sm"
            >
              {file.type === "application/pdf" ? (
                <FileText className="h-4 w-4 text-red-400 shrink-0" />
              ) : (
                <Image className="h-4 w-4 text-blue-400 shrink-0" />
              )}
              <span className="flex-1 truncate text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(file.size / 1024).toFixed(1)}KB
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
