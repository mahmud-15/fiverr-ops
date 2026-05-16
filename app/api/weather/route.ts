import { NextResponse } from "next/server"

let cachedWeather: WeatherData | null = null
let cacheTime = 0
const CACHE_DURATION = 30 * 60 * 1000

interface WeatherData {
  temp: number
  unit: string
  condition: string
  iconCode: number
  isDayTime: boolean
  humidity: number
  feelsLike: number
}

const ICON_MAP: Record<number, string> = {
  1: "☀️", 2: "☀️", 3: "🌤️", 4: "🌤️", 5: "🌤️",
  6: "🌥️", 7: "☁️", 8: "☁️", 11: "🌫️",
  12: "🌧️", 13: "🌦️", 14: "🌦️", 15: "⛈️", 16: "⛈️", 17: "⛈️",
  18: "🌧️", 19: "🌨️", 20: "🌨️", 21: "🌨️", 22: "🌨️", 23: "🌨️",
  24: "🧊", 25: "🌨️", 26: "🌧️", 29: "🌨️",
  30: "🌡️", 31: "🥶", 32: "💨", 33: "🌙", 34: "🌙",
  35: "🌙", 36: "🌙", 37: "🌙", 38: "☁️",
  39: "🌦️", 40: "🌧️", 41: "⛈️", 42: "⛈️", 43: "🌨️", 44: "🌨️",
}

export function getWeatherEmoji(iconCode: number): string {
  return ICON_MAP[iconCode] ?? "🌡️"
}

export async function GET() {
  const apiKey = process.env.ACCUWEATHER_API_KEY
  const locationKey = process.env.ACCUWEATHER_LOCATION_KEY

  if (!apiKey || !locationKey) {
    return NextResponse.json({ error: "Weather not configured" }, { status: 503 })
  }

  if (cachedWeather && Date.now() - cacheTime < CACHE_DURATION) {
    return NextResponse.json({ ...cachedWeather, emoji: getWeatherEmoji(cachedWeather.iconCode) })
  }

  try {
    const res = await fetch(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`,
      { cache: "no-store" }
    )

    if (!res.ok) throw new Error(`AccuWeather error: ${res.status}`)

    const data = await res.json()
    const c = data[0]

    const weather: WeatherData = {
      temp: Math.round(c.Temperature.Metric.Value),
      unit: "°C",
      condition: c.WeatherText,
      iconCode: c.WeatherIcon,
      isDayTime: c.IsDayTime,
      humidity: c.RelativeHumidity,
      feelsLike: Math.round(c.RealFeelTemperature.Metric.Value),
    }

    cachedWeather = weather
    cacheTime = Date.now()

    return NextResponse.json({ ...weather, emoji: getWeatherEmoji(weather.iconCode) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
