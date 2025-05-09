import { NextResponse } from "next/server"

const SEATTLE_LAT = 47.6062
const SEATTLE_LON = -122.3321
const API_KEY = process.env.OPENWEATHER_API_KEY

// Fallback mock data in case the API fails
const FALLBACK_DATA = {
  temperature: 52,
  description: "light rain",
  humidity: 80,
  windSpeed: 5.2,
  condition: "Rain",
  timestamp: new Date().toISOString(),
  isFallback: true,
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

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${SEATTLE_LAT}&lon=${SEATTLE_LON}&appid=${API_KEY}&units=imperial`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error: ${response.status} ${response.statusText}`, errorText)

      // Return fallback data instead of an error
      return NextResponse.json(
        {
          ...FALLBACK_DATA,
          error: `API returned ${response.status}. Using fallback data.`,
        },
        { status: 200 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].main,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API error:", error)

    // Return fallback data instead of an error
    return NextResponse.json(
      {
        ...FALLBACK_DATA,
        error: error instanceof Error ? error.message : "Failed to fetch weather data",
      },
      { status: 200 },
    )
  }
}
