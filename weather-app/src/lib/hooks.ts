import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type {
  WeatherData,
  TemperatureUnit,
  WeatherCondition,
} from "@/lib/types";
import { getCurrentPosition, getWeatherFromCoords } from "@/lib/api/weather";

/**
 * Default coordinates (New York City) to use when geolocation fails
 */
const DEFAULT_COORDS = { lat: 40.7128, lon: -74.006 };

/**
 * Default location name to use when geolocation fails
 */
const DEFAULT_LOCATION_NAME = "New York City, US";

/**
 * Custom fetcher for SWR that includes error handling and supports request cancellation
 *
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param requestId - Unique identifier for the request to handle cancellations
 * @param controllerRef - Reference to the AbortController
 * @returns The weather data for the specified location
 */
const weatherFetcher = async (
  lat: number,
  lon: number,
  requestId: string,
  controllerRef: React.MutableRefObject<AbortController | null>
): Promise<WeatherData> => {
  // Cancel any in-flight requests
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  // Create a new controller for this request
  const controller = new AbortController();
  controllerRef.current = controller;

  try {
    return await getWeatherFromCoords(lat, lon, controller.signal);
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
      // Re-throw the AbortError but mark it so we know it's expected
      throw error;
    }
    console.error("Error fetching weather data:", error);
    // For non-abort errors, create a user-friendly error
    throw new Error("Failed to fetch weather data. Please try again.");
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
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [customLocationName, setCustomLocationName] = useState<string>("");

  // Add a request ID tracker to prevent race conditions
  const [currentRequestId, setCurrentRequestId] = useState<string>("initial");

  // Add a pending request flag to enhance loading state detection
  const [isPendingRequest, setIsPendingRequest] = useState<boolean>(false);

  // Create a request controller reference for cancellations
  const abortControllerRef = useRef<AbortController | null>(null);

  // SWR hook for fetching weather data
  const {
    data: weather,
    error,
    isValidating,
    mutate,
  } = useSWR(
    coordinates
      ? ["weather", coordinates.lat, coordinates.lon, currentRequestId]
      : null,
    async ([_, lat, lon, requestId]) => {
      setIsPendingRequest(true);
      try {
        const result = await weatherFetcher(
          lat,
          lon,
          requestId,
          abortControllerRef
        );
        return result;
      } finally {
        setIsPendingRequest(false);
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
      // Keep previous data while new data is being fetched
      keepPreviousData: true,
      // Configure SWR to retry on non-abort errors
      shouldRetryOnError: (err) => err.name !== "AbortError",
      errorRetryInterval: 3000,
      errorRetryCount: 3,
      onError: (err) => {
        // Only log actual errors, not intentional cancellations
        if (err?.name !== "AbortError") {
          console.error("Weather data fetch error:", err);
        }
      },
    }
  );

  // Flag to track if geolocation has successfully completed
  const [geolocated, setGeolocated] = useState<boolean>(false);
  // Flag to track if a user has performed a search
  const [userHasSearched, setUserHasSearched] = useState<boolean>(false);

  // ENHANCED LOADING STATE DETECTION
  // Consider the app to be in a loading state if:
  // 1. We have no weather data and no error (initial load)
  // 2. OR we have an AbortError (transition between locations)
  // 3. OR SWR is validating/revalidating
  // 4. OR we're explicitly getting the user's location
  // 5. OR we have a pending request (explicitly tracked)
  const loading =
    (!weather && !error) ||
    (error && error.name === "AbortError") ||
    isValidating ||
    isGettingLocation ||
    isPendingRequest;

  // Get location name from weather data, custom set name, or loading placeholder
  // Avoid showing "Getting your location" message to prevent redundancy
  const location =
    customLocationName ||
    weather?.location ||
    (coordinates && !customLocationName ? "Loading weather data..." : "");

  /**
   * Get user's current location using browser geolocation
   */
  const getUserLocation = useCallback(async () => {
    // If we're already getting location, don't trigger another request
    if (isGettingLocation) return;

    // Check if we have permissions before attempting to get location
    const checkPermission = async () => {
      // Only run permission check in browser environment
      if (typeof navigator === "undefined" || !navigator.permissions) {
        return "prompt"; // Default to prompt if permissions API not available
      }

      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        return permissionStatus.state; // 'granted', 'denied', or 'prompt'
      } catch (error) {
        console.error("Permission check error:", error);
        return "prompt"; // Default to prompt on error
      }
    };

    // Get permission status
    const permissionState = await checkPermission();

    // If permission is denied, don't even try
    if (permissionState === "denied") {
      toast.error(
        "Location access is denied. Please update your browser settings to use this feature."
      );
      setCoordinates(DEFAULT_COORDS);
      setCustomLocationName(DEFAULT_LOCATION_NAME);
      return;
    }

    setIsGettingLocation(true);
    setIsPendingRequest(true);

    try {
      // Generate a unique request ID for this geolocation request
      const requestId = `geo-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      setCurrentRequestId(requestId);

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
      // We'll keep isPendingRequest true until the weather data is fetched
    }
  }, [isGettingLocation]);

  /**
   * Set weather data for a specific location
   *
   * @param lat - Latitude of the location
   * @param lon - Longitude of the location
   * @param locationName - Optional name to display for this location
   */
  const setLocation = useCallback(
    (lat: number, lon: number, locationName?: string) => {
      // Cancel any ongoing geolocation attempt when user selects a location manually
      if (isGettingLocation) {
        setIsGettingLocation(false); // Stop the geolocation process
        toast.info("Location detection canceled"); // Inform the user
      }

      // Set the pending request flag to ensure loading state
      setIsPendingRequest(true);

      // Generate a unique request ID to track this specific request
      const requestId = `search-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      setCurrentRequestId(requestId);

      setCoordinates({ lat, lon });
      if (locationName) {
        setCustomLocationName(locationName);
      } else {
        setCustomLocationName("");
      }

      // Mark that the user has explicitly searched for a location
      setUserHasSearched(true);

      toast.success(
        `Weather updated for ${locationName || "selected location"}`
      );
    },
    [isGettingLocation]
  );

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

    // Set pending request flag
    setIsPendingRequest(true);

    // Generate a new request ID for the retry
    const requestId = `retry-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    setCurrentRequestId(requestId);

    try {
      await mutate(); // Trigger a re-fetch with SWR
      toast.success("Weather data refreshed", { id: toastId });
    } catch (error: any) {
      // Only show error if it's not an AbortError (which is expected during cancellation)
      if (error.name !== "AbortError") {
        toast.error("Failed to refresh weather data", { id: toastId });
        console.error("Retry error:", error);
      } else {
        // For AbortError, just dismiss the loading toast without an error
        toast.dismiss(toastId);
      }
    } finally {
      // We'll keep isPendingRequest true until the weather fetcher resolves
    }
  }, [mutate]);

  // Effect to get initial location on component mount
  useEffect(() => {
    // Only try to get location on first load if the user hasn't already searched
    if (!userHasSearched && !coordinates && !geolocated) {
      // Check if we have permission before trying to get location automatically
      const checkAndGetLocation = async () => {
        // Only proceed in browser environment
        if (typeof navigator === "undefined" || !navigator.permissions) {
          // If permissions API isn't available, just try geolocation directly
          // This will prompt the user in most browsers
          getUserLocation();
          return;
        }

        try {
          // Check geolocation permission status
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });

          // Only skip geolocation if permission is explicitly denied
          // For 'prompt' state, we should still try (user will be prompted)
          if (permissionStatus.state !== "denied") {
            getUserLocation();
          } else {
            // Use default location if permission explicitly denied
            const requestId = `default-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`;
            setCurrentRequestId(requestId);
            setIsPendingRequest(true);
            setCoordinates(DEFAULT_COORDS);
            setCustomLocationName(DEFAULT_LOCATION_NAME);

            toast.info(
              "Location access is denied. Using default location instead."
            );
          }
        } catch (error) {
          console.error("Permission check error:", error);
          // Use default location on error
          const requestId = `default-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          setCurrentRequestId(requestId);
          setIsPendingRequest(true);
          setCoordinates(DEFAULT_COORDS);
          setCustomLocationName(DEFAULT_LOCATION_NAME);
          toast.error(
            "Error checking location permissions. Using default location instead."
          );
        }
      };

      checkAndGetLocation();

      // Shorter fallback timer (60 seconds) for defaulting to NYC
      const fallbackTimer = setTimeout(() => {
        // Only apply the fallback if:
        // 1. We still don't have coordinates set (no location determined yet)
        // 2. Geolocation hasn't succeeded
        // 3. User hasn't performed their own search
        if (!coordinates && !geolocated && !userHasSearched) {
          const requestId = `fallback-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          setCurrentRequestId(requestId);
          setIsPendingRequest(true);
          setCoordinates(DEFAULT_COORDS);
          setCustomLocationName(DEFAULT_LOCATION_NAME);
          toast.info(
            "Unable to get your location. Using default location instead."
          );
        }
      }, 60000); // 60 seconds (1 minute)

      // Capture the current controller reference for the cleanup function
      const currentController = abortControllerRef.current;

      return () => {
        clearTimeout(fallbackTimer);
        // Cancel any in-flight requests when component unmounts
        // Using the captured reference instead of the potentially changed ref
        if (currentController) {
          currentController.abort();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasSearched, geolocated]);

  // Handle errors from SWR with simple toast message
  useEffect(() => {
    // Only show error message for non-abort errors
    // Abort errors are expected and should be silently ignored
    if (error && error.name !== "AbortError") {
      toast.error(
        `Failed to fetch weather data: ${
          error.message || "Please check your connection and try again."
        }`,
        {
          duration: 6000, // Show for longer
          id: "weather-fetch-error", // Prevent duplicate toasts
          action: {
            label: "Retry",
            onClick: () => retryFetch(),
          },
        }
      );
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
    geolocated,
    isPendingRequest, // Add this to the returned object so UI can access it
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
  // Always initialize with 'metric' on the server to prevent hydration mismatches
  const [unit, setUnit] = useState<TemperatureUnit>("metric");

  // Use useEffect to update from localStorage only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUnit = localStorage.getItem("weatherapp_temp_unit");
      if (savedUnit === "imperial" || savedUnit === "metric") {
        setUnit(savedUnit);
      }
    }
  }, []);

  /**
   * Toggle between metric (°C) and imperial (°F) units
   * and save preference to localStorage
   */
  const toggleUnit = useCallback(() => {
    setUnit((prev: TemperatureUnit) => {
      const newUnit = prev === "metric" ? "imperial" : "metric";
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("weatherapp_temp_unit", newUnit);
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
  const displayTemp = useCallback(
    (temp: number): string => {
      return unit === "imperial"
        ? `${Math.round((temp * 9) / 5 + 32)}°F`
        : `${Math.round(temp)}°C`;
    },
    [unit]
  );

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
      case "rain":
        return "rain";
      case "snow":
        return "snow";
      case "sun":
        return "sun";
      case "wind":
        return "wind";
      default:
        return "clouds";
    }
  };

  return { getWeatherIcon };
}
