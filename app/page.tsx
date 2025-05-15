import { RainCounter } from "@/components/rain-counter"
import { WeatherDisplay } from "@/components/weather-display"
import { LastUpdated } from "@/components/last-updated"
import { AlertCircle } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 p-4 text-white">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">Seattle Rain Tracker</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <RainCounter />
          <WeatherDisplay />
        </div>

        <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-4 text-amber-400">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            <h2 className="font-semibold">API Key Troubleshooting</h2>
          </div>
          <p className="text-sm">If you're seeing fallback data, please check that:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Your OpenWeather API key is correctly set in environment variables</li>
            <li>The API key is active (it may take a few hours after signup to activate)</li>
            <li>You're using the correct API key format</li>
          </ul>
        </div>

        <div className="bg-white/30 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Current Rainfall Data</h2>
          <div className="space-y-4">
            <p>Today's rainfall: 0.5 inches</p>
            <p>Weekly total: 2.3 inches</p>
            <LastUpdated timestamp={new Date()} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <footer className="text-center text-sm text-slate-400">
            Data updates hourly. Weather data provided by OpenWeatherMap.
          </footer>
        </div>
      </div>
    </main>
  )
}
