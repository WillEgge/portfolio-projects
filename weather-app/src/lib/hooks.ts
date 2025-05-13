import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type { WeatherData, TemperatureUnit } from "@/lib/types";
import { getCurrentPosition, getWeatherFromCoords } from "@/lib/api/weather";

// Default coordinates (New York) as fallback
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.0060 };

// Custom fetcher for SWR that includes error handling
const weatherFetcher = async ([_, lat, lon]: [string, number, number]) => {
  try {
    return await getWeatherFromCoords(lat, lon);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data. Please try again later.");
  }
};

// Custom hook to manage weather data, location, and loading state
export function useWeatherData() {
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // SWR hook for fetching weather data
  const { data: weather, error, isValidating } = useSWR(
    coordinates ? ['weather', coordinates.lat, coordinates.lon] : null,
    weatherFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Determine if we're in a loading state
  const loading = (!weather && !error) || isValidating || isGettingLocation;
  
  // Get location name from weather data
  const location = weather?.location || "";

  // Effect to get initial location on component mount
  useEffect(() => {
    // Try to get user's location on first load
    getUserLocation();
    
    // Fallback to default location after a timeout if geolocation fails
    const fallbackTimer = setTimeout(() => {
      if (!coordinates) {
        setCoordinates(DEFAULT_COORDS);
        toast.info("Using default location. Enable location services for local weather.");
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Handle errors from SWR
  useEffect(() => {
    if (error) {
      toast.error("Could not fetch weather data. Please try again later.");
      console.error("Weather data error:", error);
    }
  }, [error]);

  // Get user's current location
  const getUserLocation = useCallback(async () => {
    setIsGettingLocation(true);
    
    try {
      if ("geolocation" in navigator) {
        toast.info("Getting your location...");
        
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        setCoordinates({ lat: latitude, lon: longitude });
        toast.success("Weather updated for your location");
      } else {
        toast.error("Geolocation is not supported by your browser");
        setCoordinates(DEFAULT_COORDS);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      toast.error("Could not get your location. Check browser permissions.");
      setCoordinates(DEFAULT_COORDS);
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const toggleInfoPanel = () => {
    setShowInfo((prev) => !prev);
  };

  return {
    loading,
    weather,
    location,
    showInfo,
    getUserLocation,
    toggleInfoPanel,
    error,
  };
}

// Custom hook to manage temperature unit toggling and conversion
export function useTemperatureUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>("metric");

  const toggleUnit = () => {
    setUnit((prev: TemperatureUnit) =>
      prev === "metric" ? "imperial" : "metric"
    );
  };

  const displayTemp = (temp: number) => {
    return unit === "imperial"
      ? `${Math.round((temp * 9) / 5 + 32)}°F`
      : `${Math.round(temp)}°C`;
  };

  return { unit, toggleUnit, displayTemp };
}

// Custom hook for weather icon selection
export function useWeatherIcon() {
  const getWeatherIcon = (icon: string) => {
    // Fixed the missing return statements in the conditions
    if (icon === "rain") return "rain";
    if (icon === "snow") return "snow";
    if (icon === "sun") return "sun";
    if (icon === "wind") return "wind";
    return "clouds";
  };

  return { getWeatherIcon };
}
