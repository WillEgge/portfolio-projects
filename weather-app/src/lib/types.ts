export type ErrorProps = {
  error: Error;
  reset: () => void;
};

export type ProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
};

export type WeatherCondition = "rain" | "snow" | "sun" | "wind" | "clouds";

export type TemperatureUnit = "metric" | "imperial";

export type CurrentWeather = {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather: string;
  icon: WeatherCondition;
};

export type ForcastDay = {
  date: string;
  temp: number;
  icon: WeatherCondition;
};

export type WeatherData = {
  location: string;
  current: CurrentWeather;
  forcast: ForcastDay[];
};