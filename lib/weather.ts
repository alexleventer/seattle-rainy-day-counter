// This file contains functions to fetch and process weather data for Seattle

// Function to check if it's currently raining in Seattle
export async function getCurrentWeather() {
  try {
    const response = await fetch("/api/weather", {
      next: { revalidate: 0 }, // Don't cache this request
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`)
    }

    const data = await response.json()

    // If there's an error message but we have fallback data, log it but don't throw
    if (data.error) {
      console.warn(`Weather API warning: ${data.error}`)
    }

    return data
  } catch (error) {
    console.error("Error fetching current weather:", error)
    throw error
  }
}

// Function to check if it rained today and get days since last rain
export async function checkWeather() {
  // In a real app, we would store this in a database
  // For demo purposes, we'll use localStorage on the client
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem("seattleRainData")
    let rainData = storedData ? JSON.parse(storedData) : { lastRainDate: null, daysSinceRain: 0 }

    try {
      const weatherData = await getCurrentWeather()
      const today = new Date().toISOString().split("T")[0]

      // Check if it's raining now
      const isRaining =
        weatherData.condition?.toLowerCase().includes("rain") ||
        weatherData.condition?.toLowerCase().includes("drizzle")

      // If it's raining today and we haven't recorded it yet
      if (isRaining && rainData.lastRainDate !== today) {
        rainData = {
          lastRainDate: today,
          daysSinceRain: 0,
        }
        localStorage.setItem("seattleRainData", JSON.stringify(rainData))
      }
      // If it's not raining and we need to increment the counter (once per day)
      else if (!isRaining && rainData.lastRainDate !== today) {
        // Check if we've already incremented the counter today
        const lastCheckedDate = localStorage.getItem("lastCheckedDate")

        if (lastCheckedDate !== today) {
          // Only increment if we haven't checked today
          rainData.daysSinceRain += 1
          localStorage.setItem("seattleRainData", JSON.stringify(rainData))
          localStorage.setItem("lastCheckedDate", today)
        }
      }

      return {
        isRaining,
        lastRainDate: rainData.lastRainDate,
        daysSinceRain: rainData.daysSinceRain,
        isFallback: weatherData.isFallback || false,
        error: weatherData.error,
      }
    } catch (error) {
      console.error("Error checking rain status:", error)
      // Return stored data if available
      return {
        isRaining: false,
        lastRainDate: rainData.lastRainDate,
        daysSinceRain: rainData.daysSinceRain,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Server-side fallback
  return {
    isRaining: false,
    lastRainDate: null,
    daysSinceRain: 0,
  }
}
