"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, AlertTriangle, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentWeather } from "@/lib/weather"
import { TemperatureTrend } from "@/components/temperature-trend"

type WeatherData = {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  condition: string
  isFallback?: boolean
  error?: string
  temperatureTrend?: 'rising' | 'falling' | 'stable'
}

export function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCurrentWeather()
        setWeather(data)
        setLoading(false)
      } catch (err) {
        console.error("Error in WeatherDisplay:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
        setLoading(false)
      }
    }

    fetchWeather()
    // Update every hour
    const interval = setInterval(fetchWeather, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = () => {
    if (!weather) return <Cloud size={48} />

    const condition = weather.condition?.toLowerCase() || ""
    if (condition.includes("rain") || condition.includes("drizzle")) {
      return <CloudRain size={48} className="text-blue-400" />
    } else if (condition.includes("clear") || condition.includes("sun")) {
      return <Sun size={48} className="text-yellow-400" />
    } else {
      return <Cloud size={48} className="text-slate-400" />
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Current Seattle Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-red-400">
            <AlertTriangle size={36} />
            <p className="text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        ) : weather ? (
          <div className="space-y-4">
            {weather.error && (
              <div className="flex items-center gap-2 rounded-md bg-amber-900/30 p-2 text-amber-400">
                <AlertCircle size={16} />
                <span className="text-xs">{weather.error}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {getWeatherIcon()}
              <div>
                <p className="text-3xl font-bold">{Math.round(weather.temperature)}°F</p>
                <p className="capitalize text-slate-300">{weather.description}</p>
                {weather.temperatureTrend && (
                  <TemperatureTrend trend={weather.temperatureTrend} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900 p-3">
              <div>
                <p className="text-sm text-slate-400">Humidity</p>
                <p className="font-medium">{weather.humidity}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Wind</p>
                <p className="font-medium">{weather.windSpeed} mph</p>
              </div>
            </div>

            {weather.isFallback && (
              <p className="mt-2 text-center text-sm text-amber-400">
                Using fallback weather data. Some information may not be accurate.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
