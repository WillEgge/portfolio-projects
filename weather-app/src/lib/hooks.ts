import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type { WeatherData, TemperatureUnit, WeatherCondition } from "@/lib/types";
import { getCurrentPosition, getWeatherFromCoords } from "@/lib/api/weather";

/**
 * Default coordinates (New York City) to use when geolocation fails
 */
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.0060 };

/**
 * Custom fetcher for SWR that includes error handling
 * 
 * @param params - Array containing the key and coordinates
 * @returns The weather data for the specified location
 */
const weatherFetcher = async ([_, lat, lon]: [string, number, number]): Promise<WeatherData> => {
  try {
    return await getWeatherFromCoords(lat, lon);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to fetch weather data. Please try again later.");
  }
};

/**
 * Custom hook to manage weather data, location, and loading state
 * 
 * Provides functionality for:
 * - Fetching weather data based on coordinates
 * - Getting user's location via geolocation
 * - Handling loading and error states
 * - Controlling info panel visibility
 * 
 * @returns Weather data and control functions
 */
export function useWeatherData() {
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [customLocationName, setCustomLocationName] = useState<string>("");

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
  
  // Get location name from weather data or custom set name
  const location = customLocationName || weather?.location || "";

  /**
   * Get user's current location using browser geolocation
   */
  const getUserLocation = useCallback(async () => {
    setIsGettingLocation(true);
    
    try {
      if ("geolocation" in navigator) {
        toast.info("Getting your location...");
        
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        setCoordinates({ lat: latitude, lon: longitude });
        setCustomLocationName(""); // Clear any custom location name
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
  
  /**
   * Set weather data for a specific location
   * 
   * @param lat - Latitude of the location
   * @param lon - Longitude of the location
   * @param locationName - Optional name to display for this location
   */
  const setLocation = useCallback((lat: number, lon: number, locationName?: string) => {
    setCoordinates({ lat, lon });
    if (locationName) {
      setCustomLocationName(locationName);
    } else {
      setCustomLocationName("");
    }
    toast.success(`Weather updated for ${locationName || "selected location"}`);
  }, []);

  /**
   * Toggle the visibility of the info panel
   */
  const toggleInfoPanel = () => {
    setShowInfo((prev) => !prev);
  };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle errors from SWR
  useEffect(() => {
    if (error) {
      toast.error("Could not fetch weather data. Please try again later.");
      console.error("Weather data error:", error);
    }
  }, [error]);

  return {
    loading,
    weather,
    location,
    showInfo,
    getUserLocation,
    toggleInfoPanel,
    error,
    setLocation,
  };
}

/**
 * Custom hook to manage temperature unit toggling and conversion
 * 
 * Provides:
 * - Current temperature unit (metric/imperial)
 * - Function to toggle between units
 * - Function to format temperature display
 * 
 * @returns Temperature unit state and utility functions
 */
export function useTemperatureUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>("metric");

  /**
   * Toggle between metric (°C) and imperial (°F) units
   */
  const toggleUnit = () => {
    setUnit((prev: TemperatureUnit) =>
      prev === "metric" ? "imperial" : "metric"
    );
  };

  /**
   * Format a temperature for display in the current unit
   * 
   * @param temp - Temperature in metric units (Celsius)
   * @returns Formatted temperature string with unit symbol
   */
  const displayTemp = (temp: number): string => {
    return unit === "imperial"
      ? `${Math.round((temp * 9) / 5 + 32)}°F`
      : `${Math.round(temp)}°C`;
  };

  return { unit, toggleUnit, displayTemp };
}

/**
 * Custom hook for weather icon selection
 * 
 * Maps weather condition strings to standardized icon types
 * 
 * @returns Function to get the appropriate icon type
 */
export function useWeatherIcon() {
  /**
   * Convert a weather condition string to a standardized icon type
   * 
   * @param icon - The weather condition string
   * @returns The standardized WeatherCondition type
   */
  const getWeatherIcon = (icon: string): WeatherCondition => {
    switch (icon) {
      case "rain": return "rain";
      case "snow": return "snow";
      case "sun": return "sun";
      case "wind": return "wind";
      default: return "clouds";
    }
  };

  return { getWeatherIcon };
}