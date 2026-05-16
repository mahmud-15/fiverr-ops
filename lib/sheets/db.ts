import { getSheetsClient, SPREADSHEET_ID } from "./client"
import { v4 as uuidv4 } from "uuid"

// TypeScript interfaces

export interface ComplianceCheck {
  id: string
  created_at: string
  input_text: string
  input_sources: string[]
  results: Record<string, unknown>[]
  verdict: string
  issues_count: number
}

export interface ProfileAudit {
  id: string
  created_at: string
  profile_url: string
  username: string
  overall_score: number
  results: Record<string, unknown>
}

export interface FeedItem {
  id: string
  created_at: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  urgency: string
  published_at: string
  raw_content: string
  is_read: boolean
}

export interface Template {
  id: string
  created_at: string
  title: string
  scenario: string
  content: string
  tags: string[]
  use_count: number
  compliance_checked: boolean
}

export interface KBArticle {
  id: string
  created_at: string
  title: string
  content: string
  category: string
  tags: string[]
  source: string
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  buyer_name: string
  title: string
  status: string
  budget: number | null
  deadline: string | null
  description: string
  notes: string
  order_id: string
  platform_link: string
  tags: string[]
}

export interface BriefAnalysis {
  id: string
  created_at: string
  original_brief: string
  analysis: Record<string, unknown>
}

export interface ComplianceRule {
  id: string
  created_at: string
  type: string
  pattern: string
  severity: "critical" | "high" | "medium" | "low"
  suggestion: string
  policy_ref: string
  is_enabled: boolean
  is_regex: boolean
}

// Sheet names (tabs in the spreadsheet)
export const SHEETS = {
  COMPLIANCE_CHECKS: "compliance_checks",
  PROFILE_AUDITS: "profile_audits",
  FEED_ITEMS: "feed_items",
  TEMPLATES: "templates",
  KB_ARTICLES: "kb_articles",
  PROJECTS: "projects",
  BRIEF_ANALYSES: "brief_analyses",
  COMPLIANCE_RULES: "compliance_rules",
} as const

// Column definitions for each sheet (order matters - matches spreadsheet columns)
export const COLUMNS: Record<string, string[]> = {
  compliance_checks: ["id", "created_at", "input_text", "input_sources", "results", "verdict", "issues_count"],
  profile_audits: ["id", "created_at", "profile_url", "username", "overall_score", "results"],
  feed_items: ["id", "created_at", "title", "summary", "url", "source", "category", "urgency", "published_at", "raw_content", "is_read"],
  templates: ["id", "created_at", "title", "scenario", "content", "tags", "use_count", "compliance_checked"],
  kb_articles: ["id", "created_at", "title", "content", "category", "tags", "source"],
  projects: ["id", "created_at", "updated_at", "buyer_name", "title", "status", "budget", "deadline", "description", "notes", "order_id", "platform_link", "tags"],
  brief_analyses: ["id", "created_at", "original_brief", "analysis"],
  compliance_rules: ["id", "created_at", "type", "pattern", "severity", "suggestion", "policy_ref", "is_enabled", "is_regex"],
}

// JSON fields that need serialization/deserialization
const JSON_FIELDS = new Set([
  "input_sources",
  "results",
  "tags",
  "analysis",
])

function isJsonField(field: string): boolean {
  return JSON_FIELDS.has(field)
}

// Convert a string array row to an object using column definitions
export function rowToObject(sheetName: string, row: string[]): Record<string, unknown> {
  const columns = COLUMNS[sheetName]
  if (!columns) return {}
  const obj: Record<string, unknown> = {}
  columns.forEach((col, i) => {
    const raw = row[i] ?? ""
    if (isJsonField(col)) {
      try {
        obj[col] = raw ? JSON.parse(raw) : col === "tags" ? [] : null
      } catch {
        obj[col] = raw
      }
    } else {
      obj[col] = raw
    }
  })
  return obj
}

// Convert an object to a string array in column order
export function objectToRow(sheetName: string, obj: Record<string, unknown>): string[] {
  const columns = COLUMNS[sheetName]
  if (!columns) return []
  return columns.map((col) => {
    const val = obj[col]
    if (val === undefined || val === null) return ""
    if (isJsonField(col)) {
      return JSON.stringify(val)
    }
    return String(val)
  })
}

// Fetch all rows from a sheet (skipping header row 1)
export async function getAllRows(sheetName: string): Promise<Record<string, unknown>[]> {
  try {
    const sheets = getSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:ZZ`,
    })
    const rows = response.data.values || []
    return rows
      .filter((row) => row[0] !== undefined && row[0] !== "")
      .map((row) => rowToObject(sheetName, row.map(String)))
  } catch (error) {
    console.error(`getAllRows(${sheetName}) error:`, error)
    return []
  }
}

// Find a single row by id
export async function getById(sheetName: string, id: string): Promise<Record<string, unknown> | null> {
  const rows = await getAllRows(sheetName)
  return rows.find((r) => r.id === id) || null
}

// Find the 1-based row index of the row with matching id (row 1 is header)
export async function findRowIndex(sheetName: string, id: string): Promise<number> {
  try {
    const sheets = getSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:A`,
    })
    const rows = response.data.values || []
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        return i + 2 // +2 because data starts at row 2 (row 1 is header)
      }
    }
    return -1
  } catch (error) {
    console.error(`findRowIndex(${sheetName}, ${id}) error:`, error)
    return -1
  }
}

// Append a new row
export async function insert<T extends Record<string, unknown>>(
  sheetName: string,
  data: Partial<T>
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString()
  const obj: Record<string, unknown> = {
    id: uuidv4(),
    created_at: now,
    ...data,
  }
  const row = objectToRow(sheetName, obj)
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  })
  return obj
}

// Update a row by id
export async function update<T extends Record<string, unknown>>(
  sheetName: string,
  id: string,
  updates: Partial<T>
): Promise<Record<string, unknown> | null> {
  const rowIndex = await findRowIndex(sheetName, id)
  if (rowIndex === -1) return null

  const existing = await getById(sheetName, id)
  if (!existing) return null

  const columns = COLUMNS[sheetName]
  const merged: Record<string, unknown> = { ...existing, ...updates }
  if (columns.includes("updated_at")) {
    merged.updated_at = new Date().toISOString()
  }

  const row = objectToRow(sheetName, merged)
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  })
  return merged
}

// Delete a row by id
export async function deleteRow(sheetName: string, id: string): Promise<boolean> {
  const rowIndex = await findRowIndex(sheetName, id)
  if (rowIndex === -1) return false

  const sheets = getSheetsClient()

  // Get sheetId from metadata
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const sheet = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  )
  if (!sheet?.properties?.sheetId === undefined) return false
  const sheetId = sheet?.properties?.sheetId ?? 0

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-based
              endIndex: rowIndex,       // exclusive
            },
          },
        },
      ],
    },
  })
  return true
}

// ─── Typed convenience functions ──────────────────────────────────────────────

// Compliance checks
export const complianceChecks = {
  getAll: () => getAllRows(SHEETS.COMPLIANCE_CHECKS) as unknown as Promise<ComplianceCheck[]>,
  getById: (id: string) => getById(SHEETS.COMPLIANCE_CHECKS, id) as unknown as Promise<ComplianceCheck | null>,
  insert: (data: Partial<ComplianceCheck>) => insert(SHEETS.COMPLIANCE_CHECKS, data as Record<string, unknown>) as unknown as Promise<ComplianceCheck>,
}

// Profile audits
export const profileAudits = {
  getAll: () => getAllRows(SHEETS.PROFILE_AUDITS) as unknown as Promise<ProfileAudit[]>,
  insert: (data: Partial<ProfileAudit>) => insert(SHEETS.PROFILE_AUDITS, data as Record<string, unknown>) as unknown as Promise<ProfileAudit>,
}

// Feed items
export const feedItems = {
  getAll: () => getAllRows(SHEETS.FEED_ITEMS) as unknown as Promise<FeedItem[]>,
  insert: (data: Partial<FeedItem>) => insert(SHEETS.FEED_ITEMS, data as Record<string, unknown>) as unknown as Promise<FeedItem>,
  update: (id: string, updates: Partial<FeedItem>) => update(SHEETS.FEED_ITEMS, id, updates as Record<string, unknown>) as unknown as Promise<FeedItem | null>,
  bulkInsert: async (items: Partial<FeedItem>[]) => {
    for (const item of items) await insert(SHEETS.FEED_ITEMS, item as Record<string, unknown>)
  },
}

// Templates
export const templates = {
  getAll: () => getAllRows(SHEETS.TEMPLATES) as unknown as Promise<Template[]>,
  getById: (id: string) => getById(SHEETS.TEMPLATES, id) as unknown as Promise<Template | null>,
  insert: (data: Partial<Template>) => insert(SHEETS.TEMPLATES, data as Record<string, unknown>) as unknown as Promise<Template>,
  update: (id: string, updates: Partial<Template>) => update(SHEETS.TEMPLATES, id, updates as Record<string, unknown>) as unknown as Promise<Template | null>,
  delete: (id: string) => deleteRow(SHEETS.TEMPLATES, id),
}

// KB Articles
export const kbArticles = {
  getAll: () => getAllRows(SHEETS.KB_ARTICLES) as unknown as Promise<KBArticle[]>,
  getById: (id: string) => getById(SHEETS.KB_ARTICLES, id) as unknown as Promise<KBArticle | null>,
  insert: (data: Partial<KBArticle>) => insert(SHEETS.KB_ARTICLES, data as Record<string, unknown>) as unknown as Promise<KBArticle>,
  update: (id: string, updates: Partial<KBArticle>) => update(SHEETS.KB_ARTICLES, id, updates as Record<string, unknown>) as unknown as Promise<KBArticle | null>,
  delete: (id: string) => deleteRow(SHEETS.KB_ARTICLES, id),
}

// Projects
export const projects = {
  getAll: () => getAllRows(SHEETS.PROJECTS) as unknown as Promise<Project[]>,
  getById: (id: string) => getById(SHEETS.PROJECTS, id) as unknown as Promise<Project | null>,
  insert: (data: Partial<Project>) => insert(SHEETS.PROJECTS, data as Record<string, unknown>) as unknown as Promise<Project>,
  update: (id: string, updates: Partial<Project>) => update(SHEETS.PROJECTS, id, updates as Record<string, unknown>) as unknown as Promise<Project | null>,
  delete: (id: string) => deleteRow(SHEETS.PROJECTS, id),
}

// Brief analyses
export const briefAnalyses = {
  getAll: () => getAllRows(SHEETS.BRIEF_ANALYSES) as unknown as Promise<BriefAnalysis[]>,
  insert: (data: Partial<BriefAnalysis>) => insert(SHEETS.BRIEF_ANALYSES, data as Record<string, unknown>) as unknown as Promise<BriefAnalysis>,
}

// Compliance rules
export const complianceRules = {
  getAll: () => getAllRows(SHEETS.COMPLIANCE_RULES) as unknown as Promise<ComplianceRule[]>,
  getEnabled: async () => {
    const all = await getAllRows(SHEETS.COMPLIANCE_RULES) as unknown as ComplianceRule[]
    return all.filter((r) => String(r.is_enabled) === "true" || r.is_enabled === true)
  },
  getById: (id: string) => getById(SHEETS.COMPLIANCE_RULES, id) as unknown as Promise<ComplianceRule | null>,
  insert: (data: Partial<ComplianceRule>) => insert(SHEETS.COMPLIANCE_RULES, data as Record<string, unknown>) as unknown as Promise<ComplianceRule>,
  update: (id: string, updates: Partial<ComplianceRule>) => update(SHEETS.COMPLIANCE_RULES, id, updates as Record<string, unknown>) as unknown as Promise<ComplianceRule | null>,
  delete: (id: string) => deleteRow(SHEETS.COMPLIANCE_RULES, id),
}
