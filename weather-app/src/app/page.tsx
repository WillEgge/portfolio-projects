"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPinIcon,
  WindIcon,
  DropletIcon,
  InfoIcon,
} from "lucide-react";
import {
  useWeatherData,
  useTemperatureUnit,
} from "@/lib/hooks";
import { WeatherIcon } from "@/components/WeatherIcon";

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Info Panel */}
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
          <div className="flex items-center text-sm text-muted-foreground">
            <InfoIcon className="w-4 h-4 mr-2" />
            <span>This is a portfolio project with real weather data.</span>
          </div>
        </section>
      )}

      {/* Location and Controls */}
      <section className="my-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="text-primary" />
            {loading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <h2 className="text-2xl font-bold">{location}</h2>
            )}
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={toggleUnit} disabled={loading}>
              {unit === "metric" ? "Switch to °F" : "Switch to °C"}
            </Button>
            <Button onClick={getUserLocation} disabled={loading}>
              My Location
            </Button>
          </div>
        </div>
      </section>

      {/* Main content with spacing */}
      <div className="grid grid-cols-1 gap-8">
        {/* Current Weather Card */}
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
                <div className="flex items-center gap-3">
                  <WeatherIcon condition={weather.current.icon} />
                  <span className="text-4xl font-bold">
                    {displayTemp(weather.current.temp)}
                  </span>
                </div>

                <div>Feels like {displayTemp(weather.current.feels_like)}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <DropletIcon className="text-primary h-5 w-5" />
                    <span>Humidity: {weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <WindIcon className="text-primary h-5 w-5" />
                    <span>Wind: {weather.current.wind_speed} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forecast Card */}
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              {loading || !weather
                ? Array(5)
                    .fill(null)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-32 w-full" />
                    ))
                : weather.forcast.map((day, index) => (
                    <div key={index} className="forecast-day">
                      <div className="font-medium">{day.date}</div>
                      <div className="my-2 flex justify-center">
                        <WeatherIcon condition={day.icon} />
                      </div>
                      <div className="temperature-small text-center">
                        {displayTemp(day.temp)}
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}