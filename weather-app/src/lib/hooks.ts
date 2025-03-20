import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { WeatherData, TemperatureUnit } from "@/lib/types";

// Mock weather data
const mockWeather: WeatherData = {
  location: "New York",
  current: {
    temp: 20,
    feels_like: 18,
    humidity: 80,
    wind_speed: 10,
    weather: "Cloudy",
    icon: "clouds",
  },
  forcast: [
    { date: "Today", temp: 20, icon: "clouds" },
    { date: "Tomorrow", temp: 22, icon: "sun" },
    { date: "Wednesday", temp: 24, icon: "sun" },
    { date: "Thursday", temp: 25, icon: "sun" },
    { date: "Friday", temp: 23, icon: "clouds" },
  ],
};

// Custom hook to manage weather data, location, and loading state
export function useWeatherData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>("");
  const [showInfo, setShowInfo] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading weather data with a delay
    const timer = setTimeout(() => {
      setWeather(mockWeather);
      setLocation(mockWeather.location);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate a geolocation update
  const getUserLocation = () => {
    setLoading(true);

    if ("geolocation" in navigator) {
      toast.info("Getting your location...");
      //In a real app, implement geolocation and API calls here
      // For now,  we're just simulating it with a delay
      setTimeout(() => {
        setLoading(false);
        toast.success("Wether updated for your location");
      }, 1500);
    } else {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

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
  };
}

// Custom hook to manage toggling and conversion

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

export function useWeatherIcon() {
  const getWeatherIcon = (icon: string) => {
    // Note: Icon JSX should be returned in the component.
    // This hook just encapsulates the logic for condition matching.
    if (icon === "rain") "rain";
    if (icon === "snow") "snow";
    if (icon === "sun") "sun";
    if (icon === "wind") "wind";
    return "clouds";
  };

  return { getWeatherIcon };
}
