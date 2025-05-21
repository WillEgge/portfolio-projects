import type { WeatherData, WeatherCondition, LocationData, HourlyForecast } from "@/lib/types";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

type Coordinates = {
  lat: number;
  lon: number;
};

// Helper to map OpenWeatherMap condition codes to our app's weather conditions
const mapWeatherCondition = (code: number): WeatherCondition => {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return "rain"; // Thunderstorm
  if (code >= 300 && code < 400) return "rain"; // Drizzle
  if (code >= 500 && code < 600) return "rain"; // Rain
  if (code >= 600 && code < 700) return "snow"; // Snow
  if (code >= 700 && code < 800) return "clouds"; // Atmosphere (fog, mist, etc.)
  if (code === 800) return "sun"; // Clear sky
  if (code >= 801 && code < 900) return "clouds"; // Clouds
  return "clouds"; // Default
};

// Format day of the week from a timestamp
const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
};

// Format time from timestamp (e.g., "9AM")
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat("en-US", { 
    hour: "numeric",
    hour12: true
  }).format(date);
};

/**
 * Process hourly forecast data from the 5-day forecast API
 * 
 * @param forecastList - Array of 3-hour forecast data points
 * @returns Processed array of hourly forecasts (for the next 24 hours)
 */
function processHourlyData(forecastList: any[]): HourlyForecast[] {
  // Take the first 8 items (24 hours) from the 3-hour forecast
  return forecastList.slice(0, 8).map((item) => ({
    time: item.dt,
    formattedTime: formatTime(item.dt),
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    pop: item.pop || 0, // Probability of precipitation (0-1)
    humidity: item.main.humidity,
    wind_speed: item.wind.speed,
    icon: mapWeatherCondition(item.weather[0].id),
    description: item.weather[0].description,
  }));
}

/**
 * Process daily forecast data from the 5-day forecast API
 * 
 * @param forecastList - Array of 3-hour forecast data points
 * @returns Processed array of daily forecasts
 */
function processDailyData(forecastList: any[]) {
  const today = new Date().getDate();
  const dailyData: { [key: string]: { temps: number[], icons: number[] } } = {};
  
  // Group forecast data by day
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = formatDay(item.dt);
    
    // Skip forecasts for the current day
    if (date.getDate() === today) {
      return;
    }
    
    if (!dailyData[day]) {
      dailyData[day] = {
        temps: [],
        icons: [],
      };
    }
    
    dailyData[day].temps.push(item.main.temp);
    dailyData[day].icons.push(item.weather[0].id);
  });
  
  // Calculate average temperature and most common weather condition for each day
  const result = Object.entries(dailyData).map(([day, data]) => {
    const avgTemp = data.temps.reduce((sum, temp) => sum + temp, 0) / data.temps.length;
    
    // Find the most common weather condition
    const iconCounts: { [key: number]: number } = {};
    let maxCount = 0;
    let mostCommonIcon = 0;
    
    data.icons.forEach((icon) => {
      iconCounts[icon] = (iconCounts[icon] || 0) + 1;
      if (iconCounts[icon] > maxCount) {
        maxCount = iconCounts[icon];
        mostCommonIcon = icon;
      }
    });
    
    return {
      date: day,
      temp: avgTemp,
      icon: mapWeatherCondition(mostCommonIcon),
    };
  });
  
  // Limit to 5 days
  return result.slice(0, 5);
}

/**
 * Get comprehensive weather data including current, hourly, and 5-day forecast
 * Using the free OpenWeatherMap API endpoints
 * 
 * @param coords - Latitude and longitude coordinates
 * @param signal - Optional AbortSignal for cancelling the request
 * @returns Promise resolving to complete weather data
 */
async function getFullWeatherData(coords: Coordinates, signal?: AbortSignal): Promise<WeatherData> {
  const { lat, lon } = coords;
  
  // First, fetch current weather data
  const currentRes = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
    { signal }
  );
  
  if (!currentRes.ok) {
    throw new Error("Failed to fetch current weather data");
  }
  
  const currentData = await currentRes.json();
  
  // Then, fetch 5-day forecast (includes hourly data in 3-hour increments)
  const forecastRes = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
    { signal }
  );
  
  if (!forecastRes.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  
  const forecastData = await forecastRes.json();
  
  // Process forecast data to get hourly and daily forecasts
  const hourlyData = processHourlyData(forecastData.list);
  const dailyData = processDailyData(forecastData.list);
  
  // Return comprehensive weather data
  return {
    location: currentData.name,
    current: {
      temp: currentData.main.temp,
      feels_like: currentData.main.feels_like,
      humidity: currentData.main.humidity,
      wind_speed: currentData.wind.speed,
      weather: currentData.weather[0].main,
      icon: mapWeatherCondition(currentData.weather[0].id),
    },
    forcast: dailyData,
    hourly: hourlyData,
  };
}

// Get weather from coordinates
export const getWeatherFromCoords = async (
  lat: number, 
  lon: number,
  signal?: AbortSignal
): Promise<WeatherData> => {
  return getFullWeatherData({ lat, lon }, signal);
};

// Get coordinates from browser geolocation
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};

/**
 * Search for locations by name using OpenWeatherMap's geocoding API
 * 
 * @param query - The search query (city name, state, country, etc.)
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Promise resolving to an array of LocationData objects
 */
export const searchLocationsByName = async (
  query: string,
  limit: number = 5
): Promise<LocationData[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format and map the API response to our LocationData type
    return data.map((item: any) => ({
      // Create a unique ID by combining name, state (if available) and country
      id: `${item.name}_${item.state || ""}_${item.country}_${item.lat}_${item.lon}`.replace(/\s+/g, ""),
      name: item.name,
      state: item.state || undefined,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (error) {
    console.error("Error searching for locations:", error);
    throw new Error("Failed to search for locations. Please try again later.");
  }
};

/**
 * Format a location object into a display string
 * 
 * @param location - The location data to format
 * @returns Formatted location string (e.g., "New York, NY, US")
 */
export const formatLocationDisplay = (location: LocationData): string => {
  const parts = [location.name];
  
  if (location.state) {
    parts.push(location.state);
  }
  
  parts.push(location.country);
  
  return parts.join(", ");
};