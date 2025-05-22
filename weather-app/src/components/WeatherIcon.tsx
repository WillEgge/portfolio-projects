import {
  CloudRainIcon,
  CloudSnowIcon,
  CloudIcon,
  SunIcon,
  WindIcon,
} from "lucide-react";
import type { WeatherCondition } from "@/lib/types";

/**
 * Props for the WeatherIcon component
 */
export interface WeatherIconProps {
  /** The weather condition to display as an icon */
  condition: WeatherCondition;
  
  /** Optional CSS class name to apply to the icon */
  className?: string;

  /** Icon size variant - default is standard size, sm is smaller */
  size?: "standard" | "sm";
}

/**
 * Renders an appropriate icon based on weather condition
 * 
 * Displays different icons for rain, snow, sun, wind, and clouds,
 * with appropriate animations for each condition.
 * 
 * @example
 * ```tsx
 * <WeatherIcon condition="rain" className="w-8 h-8" />
 * ```
 */
export function WeatherIcon({ 
  condition, 
  className = "weather-icon", 
  size = "standard" 
}: WeatherIconProps) {
  // Determine which animation class to apply based on the condition
  const getAnimationClass = (condition: WeatherCondition) => {
    switch (condition) {
      case "rain": return "animate-rain";
      case "snow": return "animate-snow";
      case "sun": return "animate-sun";
      case "wind": return "animate-spin-slow";
      default: return "animate-clouds";
    }
  };
  
  // Combine the base class with the animation class and size class
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-12 h-12";
  const iconClass = `${className} ${getAnimationClass(condition)} ${sizeClass}`;
  
  // Return the appropriate icon based on condition
  switch (condition) {
    case "rain":
      return <CloudRainIcon className={iconClass} />;
    case "snow":
      return <CloudSnowIcon className={iconClass} />;
    case "sun":
      return <SunIcon className={iconClass} />;
    case "wind":
      return <WindIcon className={iconClass} />;
    case "clouds":
    default:
      return <CloudIcon className={iconClass} />;
  }
}
