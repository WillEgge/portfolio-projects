"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CloudRainIcon,
  CloudSnowIcon,
  CloudIcon,
  SunIcon,
  MapPinIcon,
  WindIcon,
  DropletIcon,
  InfoIcon,
} from "lucide-react";
import {
  useWeatherData,
  useTemperatureUnit,
  useWeatherIcon,
} from "@/lib/hooks";
import { WeatherCondition } from "@/lib/types";

export default function Home() {
  const {
    loading,
    weather,
    location,
    showInfo,
    getUserLocation,
    toggleInfoPanel,
  } = useWeatherData();
  const { unit, toggleUnit, displayTemp } = useTemperatureUnit();
  const { getWeatherIcon } = useWeatherIcon();

  // Helper: Render the current weather icon as JSX
  const renderWeatherIcon = (icon: WeatherCondition) => {
    if (icon === "rain")
      <CloudRainIcon className="weather-icon animate-rain" />;
    if (icon === "snow")
      <CloudSnowIcon className="weather-icon animate-snow" />;
    if (icon === "sun") <SunIcon className="weather-icon animate-spin" />;
    if (icon === "wind") <WindIcon className="weather-icon animate-spin" />;
    return <CloudIcon className="weather-icon" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showInfo && (
        <section className="mb-8 bg-card border rounded-lg p-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={toggleInfoPanel}
            aria-label="Hide project info"
          >
            <span className="sr-only">Hide</span>
            &times;
          </Button>

          <h1 className="text-3xl font-bold mb-2">Weather App</h1>
          <p className="text-lg mb-4">
            A modern, responsive weather application built with Next.js 14 and
            TypeScript. View current weather conditions and a 5-day forecast
            based on your location.
          </p>
          <div>
            <InfoIcon className="w-4 h-4 mr-2" />
            <span>This is a portfolio project with mock data.</span>
          </div>
        </section>
      )}

      {/*location and controles */}
      <section>
        <div>
          <MapPinIcon />
          {loading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <h2 className="text-2xl font-bold">{location}</h2>
          )}
          <Button variant="outline" onClick={toggleUnit} disabled={loading}>
            {unit === "metric" ? "Switch to °F" : "Switch to °C"}
          </Button>
          <Button onClick={getUserLocation} disabled={loading}>
            My Location
          </Button>
        </div>
      </section>

      {/*Current weather */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Current Weather</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !weather ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  {renderWeatherIcon(weather.current.icon)}
                  <span className="text-4xl font-bold">
                    {displayTemp(weather.current.temp)}
                  </span>
                </div>

                <div>{displayTemp(weather.current.temp)}</div>

                <div>Feels like {displayTemp(weather.current.feels_like)}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <DropletIcon />
                    <span>{weather.current.humidity}%</span>
                  </div>
                  <div>
                    <WindIcon />
                    <span>Wind: {weather.current.wind_speed} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/*5-day forcast */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {loading || !weather
                ? Array(5)
                    .fill(null)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-32 w-full" />
                    ))
                : weather.forcast.map((day, index) => (
                    <div key={index} className="forcast-day">
                      <div className="font-medium">{day.date}</div>
                      <div className="my-2">{renderWeatherIcon(day.icon)}</div>
                      <div className="temperature-small">
                        {displayTemp(day.temp)}
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
