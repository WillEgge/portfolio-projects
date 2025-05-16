import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type { WeatherData, TemperatureUnit, WeatherCondition } from "@/lib/types";
import { getCurrentPosition, getWeatherFromCoords } from "@/lib/api/weather";

/**
 * Default coordinates (New York City) to use when geolocation fails
 */
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.0060 };
const DEFAULT_LOCATION_NAME = "New York City, US";

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
 * - Error recovery with retry functionality
 * 
 * @returns Weather data and control functions
 */
export function useWeatherData() {
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [customLocationName, setCustomLocationName] = useState<string>("");

  // SWR hook for fetching weather data
  const { data: weather, error, isValidating, mutate } = useSWR(
    coordinates ? ['weather', coordinates.lat, coordinates.lon] : null,
    weatherFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
      onError: (err) => {
        console.error("Weather data fetch error:", err);
      }
    }
  );

  // Flag to track if geolocation has successfully completed
  const [geolocated, setGeolocated] = useState<boolean>(false);
  // Flag to track if a user has performed a search
  const [userHasSearched, setUserHasSearched] = useState<boolean>(false);

  // Determine if we're in a loading state
  const loading = (!weather && !error) || isValidating || isGettingLocation;
  
  // Get location name from weather data, custom set name, or loading placeholder
  const location = isGettingLocation 
    ? "Getting your location..." 
    : (customLocationName || weather?.location || (coordinates && !customLocationName ? "Loading weather data..." : ""));

  /**
   * Get user's current location using browser geolocation
   */
  const getUserLocation = useCallback(async () => {
    // If we're already getting location, don't trigger another request
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    
    try {
      if ("geolocation" in navigator) {
        toast.info("Getting your location...");
        
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        setCoordinates({ lat: latitude, lon: longitude });
        setCustomLocationName(""); // Clear any custom location name
        setGeolocated(true); // Mark that geolocation succeeded 
        toast.success("Weather updated for your location");
      } else {
        toast.error("Geolocation is not supported by your browser");
        setCoordinates(DEFAULT_COORDS);
        setCustomLocationName(DEFAULT_LOCATION_NAME);
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      toast.error("Could not get your location. Check browser permissions.");
      setCoordinates(DEFAULT_COORDS);
      setCustomLocationName(DEFAULT_LOCATION_NAME);
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation]);
  
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
    
    // Mark that the user has explicitly searched for a location
    setUserHasSearched(true);
    
    toast.success(`Weather updated for ${locationName || "selected location"}`);
  }, []);

  /**
   * Toggle the visibility of the info panel
   */
  const toggleInfoPanel = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  /**
   * Retry fetching weather data after an error
   * 
   * Triggers a refresh of the weather data and shows appropriate toast messages
   */
  const retryFetch = useCallback(async () => {
    const toastId = toast.loading("Refreshing weather data...");
    try {
      await mutate(); // Trigger a re-fetch with SWR
      toast.success("Weather data refreshed", { id: toastId });
    } catch (error) {
      toast.error("Failed to refresh weather data", { id: toastId });
      console.error("Retry error:", error);
    }
  }, [mutate]);

  // Effect to get initial location on component mount
  useEffect(() => {
    // Only try to get location on first load if the user hasn't already searched
    if (!userHasSearched && !coordinates && !geolocated) {
      getUserLocation();
      
      // Fallback to default location only after a timeout (1 minute)
      // This gives reasonable time for geolocation to complete or for the user to search
      const fallbackTimer = setTimeout(() => {
        // Only apply the fallback if:
        // 1. We still don't have coordinates set (no location determined yet)
        // 2. Geolocation hasn't succeeded 
        // 3. User hasn't performed their own search
        if (!coordinates && !geolocated && !userHasSearched) {
          setCoordinates(DEFAULT_COORDS);
          setCustomLocationName(DEFAULT_LOCATION_NAME);
          toast.info("Unable to get your location. Using default location instead.");
        }
      }, 60000); // 1 minute
      
      return () => clearTimeout(fallbackTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasSearched, geolocated]);

  // Handle errors from SWR with simple toast message
  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch weather data: ${error.message || "Please check your connection and try again."}`, {
        duration: 6000, // Show for longer
        id: "weather-fetch-error", // Prevent duplicate toasts
        action: {
          label: "Retry",
          onClick: () => retryFetch()
        }
      });
      console.error("Weather data error:", error);
    }
  }, [error, retryFetch]);

  return {
    loading,
    weather,
    location,
    showInfo,
    getUserLocation,
    toggleInfoPanel,
    error,
    setLocation,
    retryFetch,
    isGettingLocation,
    userHasSearched,
    geolocated
  };
}

/**
 * Custom hook to manage temperature unit toggling and conversion
 * 
 * Provides:
 * - Current temperature unit (metric/imperial)
 * - Function to toggle between units
 * - Function to format temperature display
 * - Persists user preference in localStorage
 * 
 * @returns Temperature unit state and utility functions
 */
export function useTemperatureUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    // Try to get user's preference from localStorage
    if (typeof window !== 'undefined') {
      const savedUnit = localStorage.getItem('weatherapp_temp_unit');
      return (savedUnit === 'imperial' || savedUnit === 'metric') 
        ? savedUnit 
        : 'metric'; // Default to metric if no valid saved preference
    }
    return 'metric'; // Default value
  });

  /**
   * Toggle between metric (°C) and imperial (°F) units
   * and save preference to localStorage
   */
  const toggleUnit = useCallback(() => {
    setUnit((prev: TemperatureUnit) => {
      const newUnit = prev === "metric" ? "imperial" : "metric";
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('weatherapp_temp_unit', newUnit);
      }
      return newUnit;
    });
  }, []);
  
  /**
   * Format a temperature for display in the current unit
   * 
   * @param temp - Temperature in metric units (Celsius)
   * @returns Formatted temperature string with unit symbol
   */
  const displayTemp = useCallback((temp: number): string => {
    return unit === "imperial"
      ? `${Math.round((temp * 9) / 5 + 32)}°F`
      : `${Math.round(temp)}°C`;
  }, [unit]);

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