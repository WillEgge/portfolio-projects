import type { WeatherData, WeatherCondition } from "@/lib/types";

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

// Get current weather data
export async function getCurrentWeather(
  coords: Coordinates
): Promise<WeatherData> {
  const { lat, lon } = coords;
  
  // First, fetch current weather
  const currentRes = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  
  if (!currentRes.ok) {
    throw new Error("Failed to fetch current weather data");
  }
  
  const currentData = await currentRes.json();
  
  // Then, fetch 5-day forecast
  const forecastRes = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  
  if (!forecastRes.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  
  const forecastData = await forecastRes.json();
  
  // Process forecast data to get daily forecasts (one per day)
  const dailyForecasts = processForecastData(forecastData.list);
  
  // Map the API data to our app's data structure
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
    forcast: dailyForecasts.map((day) => ({
      date: day.day,
      temp: day.temp,
      icon: day.icon,
    })),
  };
}

// Process forecast data to get one forecast per day
function processForecastData(forecastList: any[]) {
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
      day,
      temp: avgTemp,
      icon: mapWeatherCondition(mostCommonIcon),
    };
  });
  
  // Limit to 5 days
  return result.slice(0, 5);
}

// Get weather from coordinates
export const getWeatherFromCoords = async (
  lat: number, 
  lon: number
): Promise<WeatherData> => {
  return getCurrentWeather({ lat, lon });
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