"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, AlertTriangle, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { checkWeather } from "@/lib/weather"

export function RainCounter() {
  const [days, setDays] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRaining, setIsRaining] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        setWarning(null)

        const { isRaining, lastRainDate, daysSinceRain, isFallback, error: weatherError } = await checkWeather()

        setDays(daysSinceRain)
        setIsRaining(isRaining)
        setIsFallback(!!isFallback)

        if (weatherError) {
          setWarning(weatherError)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in RainCounter:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
        setLoading(false)
      }
    }

    fetchWeather()
    // Update every hour
    const interval = setInterval(fetchWeather, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card
      className={cn(
        "overflow-hidden border-4 shadow-lg transition-colors",
        isRaining ? "border-red-500 bg-red-900/20" : "border-yellow-500 bg-yellow-900/20",
      )}
    >
      <div
        className={cn("flex items-center justify-center p-2 text-black", isRaining ? "bg-red-500" : "bg-yellow-500")}
      >
        <h2 className="text-xl font-bold uppercase tracking-wider">Days Since Last Rain in Armonk</h2>
      </div>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-red-400">
            <AlertTriangle size={48} />
            <p className="text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            {warning && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-amber-900/30 p-2 text-amber-400">
                <AlertCircle size={16} />
                <span className="text-xs">{warning}</span>
              </div>
            )}

            {isRaining ? (
              <div className="flex items-center gap-3 text-red-400">
                <CloudRain size={48} className="animate-bounce" />
                <span className="text-2xl font-semibold">It's raining now!</span>
              </div>
            ) : (
              <Cloud size={48} className="text-blue-400" />
            )}

            <div className="flex items-center justify-center rounded-lg border-8 border-dashed border-slate-700 bg-slate-800 p-6">
              <span className="text-8xl font-bold tabular-nums">{days}</span>
            </div>

            <p className="text-center text-lg">
              {isRaining
                ? "Counter will reset at midnight"
                : days === 0
                  ? "It rained today"
                  : days === 1
                    ? "1 day since last rain"
                    : `${days} days since last rain`}
            </p>

            {isFallback && (
              <p className="mt-2 text-center text-sm text-amber-400">
                Using fallback weather data. Some information may not be accurate.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
