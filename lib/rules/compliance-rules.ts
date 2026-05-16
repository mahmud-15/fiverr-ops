export type Severity = "critical" | "high" | "medium" | "low"

export interface RuleViolation {
  severity: Severity
  type: string
  match: string
  index: number
  suggestion: string
  policyRef: string
}

// Email patterns - direct and obfuscated
export const EMAIL_PATTERNS = [
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    severity: "critical" as Severity,
    type: "Direct Email Address",
    suggestion: "Remove email address. Use Fiverr messaging only.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\b[A-Za-z0-9._%+-]+\s*\[at\]\s*[A-Za-z0-9.-]+\s*\[dot\]\s*[A-Za-z]{2,}\b/gi,
    severity: "critical" as Severity,
    type: "Obfuscated Email (bracket at)",
    suggestion: "Remove obfuscated email. All communication must stay on Fiverr.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\b[A-Za-z0-9._%+-]+\s*[\(\[{]?\s*at\s*[\)\]}]?\s*[A-Za-z0-9.-]+\s*[\(\[{]?\s*dot\s*[\)\]}]?\s*[A-Za-z]{2,}\b/gi,
    severity: "critical" as Severity,
    type: "Obfuscated Email (at/dot)",
    suggestion: "Remove obfuscated email. All communication must stay on Fiverr.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\b[A-Za-z0-9._%+-]+\s*\(at\)\s*[A-Za-z0-9.-]+\s*\(dot\)\s*[A-Za-z]{2,}\b/gi,
    severity: "critical" as Severity,
    type: "Obfuscated Email (paren at)",
    suggestion: "Remove obfuscated email. All communication must stay on Fiverr.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
]

// Phone number patterns
export const PHONE_PATTERNS = [
  {
    pattern: /\+880\s*\d[\d\s-]{8,12}\b/g,
    severity: "critical" as Severity,
    type: "Bangladesh Phone Number",
    suggestion: "Remove phone number. Contact only through Fiverr messaging.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    severity: "critical" as Severity,
    type: "International Phone Number",
    suggestion: "Remove phone number. Contact only through Fiverr messaging.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\b(?:\d{3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: "critical" as Severity,
    type: "Phone Number",
    suggestion: "Remove phone number. Contact only through Fiverr messaging.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\bWhatsApp(?:\s*me|\s*at)?\s*[::]?\s*\+?\d[\d\s-]{7,15}\b/gi,
    severity: "critical" as Severity,
    type: "WhatsApp Number",
    suggestion: "Do not share WhatsApp contact. Use Fiverr chat only.",
    policyRef: "Fiverr TOS §3.1 - Off-Platform Contact",
  },
]

// URL and domain patterns
export const URL_PATTERNS = [
  {
    pattern: /https?:\/\/(?!www\.fiverr\.com)[^\s<>\"']+/gi,
    severity: "high" as Severity,
    type: "External URL",
    suggestion: "Avoid sharing external links unless strictly necessary for project delivery.",
    policyRef: "Fiverr TOS §3.2 - External Links",
  },
  {
    pattern: /\b(?!fiverr\.com)[a-zA-Z0-9-]{2,}\.(com|net|org|io|co|dev|me|biz|info)\b/gi,
    severity: "medium" as Severity,
    type: "Domain/Website Reference",
    suggestion: "Limit references to external domains to essential project information.",
    policyRef: "Fiverr TOS §3.2 - External Links",
  },
]

// Social media and messaging handle patterns
export const SOCIAL_HANDLE_PATTERNS = [
  {
    pattern: /\bWhatsApp\b(?!\s*is\s*not|\s*doesn't|\s*not\s*available)/gi,
    severity: "high" as Severity,
    type: "WhatsApp Reference",
    suggestion: "Do not direct buyers to WhatsApp. Use Fiverr messaging exclusively.",
    policyRef: "Fiverr TOS §3.1 - Off-Platform Messaging",
  },
  {
    pattern: /\bTelegram\b(?!\s*is\s*not|\s*doesn't|\s*not\s*available)/gi,
    severity: "high" as Severity,
    type: "Telegram Reference",
    suggestion: "Do not direct buyers to Telegram. Use Fiverr messaging exclusively.",
    policyRef: "Fiverr TOS §3.1 - Off-Platform Messaging",
  },
  {
    pattern: /\bDiscord\b(?!\s*is\s*not|\s*doesn't|\s*not\s*available)/gi,
    severity: "high" as Severity,
    type: "Discord Reference",
    suggestion: "Do not direct buyers to Discord. Use Fiverr messaging exclusively.",
    policyRef: "Fiverr TOS §3.1 - Off-Platform Messaging",
  },
  {
    pattern: /\bSkype\b(?!\s*is\s*not|\s*doesn't|\s*not\s*available)/gi,
    severity: "high" as Severity,
    type: "Skype Reference",
    suggestion: "Do not request Skype contact. Use Fiverr messaging exclusively.",
    policyRef: "Fiverr TOS §3.1 - Off-Platform Messaging",
  },
  {
    pattern: /\bInstagram\b(?:\s*[:\-]\s*@?[A-Za-z0-9_.]+)?/gi,
    severity: "high" as Severity,
    type: "Instagram Reference",
    suggestion: "Do not share Instagram handle. Keep all contact on Fiverr.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /@[A-Za-z0-9_.]{3,30}(?:\s|$)/g,
    severity: "medium" as Severity,
    type: "Social Media Handle",
    suggestion: "Avoid sharing social media handles in messages.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
  {
    pattern: /\bLinkedIn\b(?:\s*[:\-]\s*(?:linkedin\.com\/in\/)?[A-Za-z0-9-]+)?/gi,
    severity: "medium" as Severity,
    type: "LinkedIn Reference",
    suggestion: "Do not share LinkedIn profile in messages. Keep communication on Fiverr.",
    policyRef: "Fiverr TOS §3.1 - Contact Information",
  },
]

// Off-platform payment patterns
export const OFF_PLATFORM_PAYMENT = [
  {
    pattern: /\bPayPal\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (PayPal)",
    suggestion: "Never suggest PayPal payments. All transactions must go through Fiverr.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bWise\b|\bTransferWise\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (Wise)",
    suggestion: "Never suggest Wise transfers. All transactions must go through Fiverr.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bPayoneer\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (Payoneer)",
    suggestion: "Never suggest Payoneer payments. All transactions must go through Fiverr.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bbank\s*transfer\b|\bdirect\s*deposit\b|\bwire\s*transfer\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (Bank Transfer)",
    suggestion: "Never suggest bank transfers. All payments must be through Fiverr.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bcrypto(?:currency)?\b|\bbitcoin\b|\bBTC\b|\bETH\b|\bUSDT\b|\bstablecoin\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (Crypto)",
    suggestion: "Cryptocurrency payments are strictly prohibited on Fiverr.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bpay\s*outside\b|\boff[\s-]*fiverr\b|\bdirectly\s*pay\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment Suggestion",
    suggestion: "Never suggest payments outside of Fiverr platform.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
  {
    pattern: /\bVenmo\b|\bCash\s*App\b|\bZelle\b/gi,
    severity: "critical" as Severity,
    type: "Off-Platform Payment (P2P)",
    suggestion: "Never suggest P2P payment apps. All transactions through Fiverr only.",
    policyRef: "Fiverr TOS §4.1 - Payment Outside Fiverr",
  },
]

// File sharing patterns
export const FILE_SHARING = [
  {
    pattern: /drive\.google\.com\/[^\s<>\"']*/gi,
    severity: "medium" as Severity,
    type: "Google Drive Link",
    suggestion: "Use Fiverr's built-in file sharing or delivery system instead of Google Drive.",
    policyRef: "Fiverr Guidelines - File Delivery",
  },
  {
    pattern: /dropbox\.com\/[^\s<>\"']*/gi,
    severity: "medium" as Severity,
    type: "Dropbox Link",
    suggestion: "Use Fiverr's built-in file delivery instead of Dropbox.",
    policyRef: "Fiverr Guidelines - File Delivery",
  },
  {
    pattern: /wetransfer\.com\/[^\s<>\"']*/gi,
    severity: "medium" as Severity,
    type: "WeTransfer Link",
    suggestion: "Use Fiverr's built-in file delivery instead of WeTransfer.",
    policyRef: "Fiverr Guidelines - File Delivery",
  },
]

// Forbidden promises
export const FORBIDDEN_PROMISES = [
  {
    pattern: /\bguaranteed?\s*(?:first\s*page|top\s*rank|#1|number\s*one)\b/gi,
    severity: "critical" as Severity,
    type: "Guaranteed Ranking Promise",
    suggestion: "Never promise guaranteed rankings. Remove this claim.",
    policyRef: "Fiverr TOS §5.1 - Misleading Claims",
  },
  {
    pattern: /\bfake\s*review|\bbuy\s*review|\bboost\s*review/gi,
    severity: "critical" as Severity,
    type: "Fake Review Reference",
    suggestion: "Never reference buying or faking reviews. This is grounds for permanent ban.",
    policyRef: "Fiverr TOS §5.2 - Review Manipulation",
  },
  {
    pattern: /\b100%\s*(?:guaranteed|refund\s*guaranteed)\b/gi,
    severity: "high" as Severity,
    type: "Unrealistic Guarantee",
    suggestion: "Avoid blanket 100% guarantees. Use more measured language.",
    policyRef: "Fiverr TOS §5.1 - Misleading Claims",
  },
]

export function runRuleBasedScan(text: string): RuleViolation[] {
  const violations: RuleViolation[] = []
  const allRules = [
    ...EMAIL_PATTERNS,
    ...PHONE_PATTERNS,
    ...URL_PATTERNS,
    ...SOCIAL_HANDLE_PATTERNS,
    ...OFF_PLATFORM_PAYMENT,
    ...FILE_SHARING,
    ...FORBIDDEN_PROMISES,
  ]

  for (const rule of allRules) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      // Avoid duplicate matches for same text at same position
      const isDuplicate = violations.some(
        (v) => v.match === match![0] && v.index === match!.index
      )
      if (!isDuplicate) {
        violations.push({
          severity: rule.severity,
          type: rule.type,
          match: match[0],
          index: match.index,
          suggestion: rule.suggestion,
          policyRef: rule.policyRef,
        })
      }
    }
  }

  // Sort by severity then by index
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  violations.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return a.index - b.index
  })

  return violations
}

// Run dynamic rules from the DB (user-defined rules)
export function runDynamicRuleScan(
  text: string,
  rules: Array<{
    id: string
    type: string
    pattern: string
    severity: string
    suggestion: string
    policy_ref: string
    is_regex: boolean | string
  }>
): RuleViolation[] {
  const violations: RuleViolation[] = []

  for (const rule of rules) {
    try {
      const isRegex = rule.is_regex === true || String(rule.is_regex) === "true"
      let regex: RegExp

      if (isRegex) {
        regex = new RegExp(rule.pattern, "gi")
      } else {
        // Treat as literal string match (escape special chars)
        const escaped = rule.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        regex = new RegExp(escaped, "gi")
      }

      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        const isDuplicate = violations.some(
          (v) => v.match === match![0] && v.index === match!.index
        )
        if (!isDuplicate) {
          violations.push({
            severity: (rule.severity as Severity) || "medium",
            type: rule.type,
            match: match[0],
            index: match.index,
            suggestion: rule.suggestion,
            policyRef: rule.policy_ref,
          })
        }
      }
    } catch {
      // Skip malformed regex patterns
    }
  }

  return violations
}
