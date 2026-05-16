import OpenAI from "openai"

export const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
})

// Models
export const MODELS = {
  smart: "llama-3.3-70b-versatile",   // complex tasks: compliance, profile audit, brief analysis
  fast: "llama-3.1-8b-instant",        // bulk cheap tasks: feed processor
  vision: "llama-3.2-11b-vision-preview", // image OCR
} as const
