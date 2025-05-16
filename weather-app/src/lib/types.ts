/**
 * Types for the Weather App
 * 
 * This file contains all the TypeScript type definitions used throughout the app
 * for consistent type checking and documentation.
 */

/**
 * Error handling properties passed to error boundary components
 */
export type ErrorProps = {
  /** The error that was caught */
  error: Error;
  
  /** Function to reset the error boundary and retry rendering */
  reset: () => void;
};

/**
 * Props for provider components that wrap children
 */
export type ProviderProps = {
  /** Child components to be wrapped by the provider */
  children: React.ReactNode;
  
  /** Optional default theme to use */
  defaultTheme?: string;
  
  /** Whether to enable system theme detection */
  enableSystem?: boolean;
};

/**
 * Possible weather conditions that can be displayed with icons
 */
export type WeatherCondition = "rain" | "snow" | "sun" | "wind" | "clouds";

/**
 * Temperature measurement units
 * - metric: Celsius (°C)
 * - imperial: Fahrenheit (°F)
 */
export type TemperatureUnit = "metric" | "imperial";

/**
 * Current weather conditions for a location
 */
export type CurrentWeather = {
  /** Current temperature in metric units (Celsius) */
  temp: number;
  
  /** "Feels like" temperature in metric units (Celsius) */
  feels_like: number;
  
  /** Humidity percentage (0-100) */
  humidity: number;
  
  /** Wind speed in metric units (km/h) */
  wind_speed: number;
  
  /** Textual description of the weather */
  weather: string;
  
  /** Icon type for the current weather condition */
  icon: WeatherCondition;
};

/**
 * Weather forecast for a single day
 */
export type ForcastDay = {
  /** Formatted date string (typically day of week) */
  date: string;
  
  /** Forecasted temperature in metric units (Celsius) */
  temp: number;
  
  /** Icon type for the forecasted weather condition */
  icon: WeatherCondition;
};

/**
 * Complete weather data for a location including current conditions and forecast
 */
export type WeatherData = {
  /** Name of the location (city, region) */
  location: string;
  
  /** Current weather conditions */
  current: CurrentWeather;
  
  /** 5-day weather forecast */
  forcast: ForcastDay[];
};

/**
 * Location information returned from geocoding API
 */
export type LocationData = {
  /** Unique identifier for the location (city ID or constructed unique string) */
  id: string;
  
  /** Name of the city/town */
  name: string;
  
  /** State or province (if available) */
  state?: string;
  
  /** Country code (ISO 3166 country codes) */
  country: string;
  
  /** Latitude coordinate */
  lat: number;
  
  /** Longitude coordinate */
  lon: number;
};

/**
 * Structure for storing a saved location in favorites/history
 */
export type SavedLocation = {
  /** Unique identifier for the location */
  id: string;
  
  /** Display name (typically city, state, country format) */
  displayName: string;
  
  /** Latitude coordinate */
  lat: number;
  
  /** Longitude coordinate */
  lon: number;
  
  /** ISO timestamp when this location was added/last accessed */
  timestamp: string;
};