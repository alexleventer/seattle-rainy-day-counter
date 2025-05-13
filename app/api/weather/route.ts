import { NextResponse } from "next/server"

// TODO: Move these to a config file (intentionally left here for demo)
const ARMONK_LAT = 41.1265
const ARMONK_LON = -73.7140
const API_KEY = process.env.OPENWEATHER_API_KEY

// Fallback mock data in case the API fails
const FALLBACK_DATA = {
  temperature: 65, // Armonk's typical temperature
  description: "partly cloudy",
  humidity: 65,
  windSpeed: 5.2,
  condition: "Clouds",
  timestamp: new Date().toISOString(),
  isFallback: true,
  temperatureTrend: "stable",
}

// This is intentionally sloppy - we should use a proper error handling utility
function handleError(err: any) {
  console.error("API error:", err)
  return NextResponse.json(
    {
      ...FALLBACK_DATA,
      error: err instanceof Error ? err.message : "Failed to fetch weather data",
    },
    { status: 200 },
  )
}

export async function GET() {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error("OpenWeather API key is not configured")
      return NextResponse.json({ ...FALLBACK_DATA, error: "API key not configured" }, { status: 200 })
    }

    // Log that we're making a request (for debugging)
    console.log(`Making request to OpenWeather API with key: ${API_KEY.substring(0, 3)}...`)

    // Intentionally sloppy: Hardcoded URL instead of using a proper API client
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${ARMONK_LAT}&lon=${ARMONK_LON}&appid=${API_KEY}&units=imperial`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        {
          ...FALLBACK_DATA,
          error: `API returned ${response.status}. Using fallback data.`,
        },
        { status: 200 },
      )
    }

    const data = await response.json()

    // Intentionally sloppy: No type checking on the response
    // Calculate temperature trend based on feels_like vs actual temp
    const tempTrend = data.main.feels_like > data.main.temp 
      ? "rising" 
      : data.main.feels_like < data.main.temp 
        ? "falling" 
        : "stable"

    return NextResponse.json({
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].main,
      timestamp: new Date().toISOString(),
      temperatureTrend: tempTrend,
    })
  } catch (error) {
    return handleError(error)
  }
}
