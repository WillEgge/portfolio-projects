"use client";

/**
 * Weather App Main Page Component
 * 
 * This is the main page component for the weather application, handling:
 * - Current weather display
 * - 5-day forecast
 * - Location search with geocoding
 * - Favorites and recent locations management
 * - Temperature unit switching (°C/°F)
 * - Geolocation support
 * 
 * @module page
 */

import { toast } from "sonner";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPinIcon,
  WindIcon,
  DropletIcon,
  InfoIcon,
  StarIcon,
  Star,
  X,
  Clock,
  Search,
  Umbrella,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import {
  useWeatherData,
  useTemperatureUnit,
} from "@/lib/hooks";
import { WeatherIcon } from "@/components/WeatherIcon";
import {
  getRecentLocations,
  getFavoriteLocations,
  addToRecentLocations,
  toggleLocationFavorite,
  isLocationFavorite,
  removeFromFavoriteLocations,
} from "@/lib/services/locationStorage";
import { searchLocationsByName, formatLocationDisplay } from "@/lib/api/weather";
import type { LocationData, SavedLocation } from "@/lib/types";

/**
 * Main Weather App Component
 * 
 * Renders the complete weather application including search functionality,
 * current weather conditions, forecast, and favorites management.
 * 
 * @returns The main Weather App page component
 */
export default function Home() {
  /* ===== State Management ===== */
  // Core state from custom hooks
  // Destructure the new isPendingRequest state from the hook
  const {
    loading,
    weather,
    location,
    showInfo,
    getUserLocation,
    toggleInfoPanel,
    setLocation,
    error,
    retryFetch,
    isGettingLocation,
    userHasSearched,
    geolocated,
    isPendingRequest
  } = useWeatherData();
  const { unit, toggleUnit, displayTemp } = useTemperatureUnit();
  
  // UI state
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [hourlyPage, setHourlyPage] = useState<number>(0);
  const hoursPerPage = 6; // Number of hours to show per page
  
  // Client-only state for temperature unit to prevent hydration errors
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // Mount effect to prevent hydration mismatch with localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  /* ===== Location Search State ===== */
  // Search query and results state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Favorites and recent locations state
  const [favoriteLocations, setFavoriteLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<SavedLocation[]>([]);
  
  // Refs for search UI elements
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  /**
   * Load favorites and recent locations from storage
   * 
   * Retrieves saved locations from localStorage and updates component state.
   * 
   * @returns Void function that updates state with saved locations
   */
  const loadSavedLocations = useCallback(() => {
    setFavoriteLocations(getFavoriteLocations());
    setRecentLocations(getRecentLocations());
  }, []);
  
  /**
   * Handle search query input change
   * 
   * Updates the search query state and shows the dropdown if input is not empty.
   * 
   * @param e - React change event from input element
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setShowDropdown(true);
    }
  }, []);
  
  /**
   * Search for locations based on the current query
   * 
   * Makes an API call to the geocoding service and updates search results.
   * Shows notifications for empty results or errors.
   * 
   * @returns Promise that resolves when search is complete
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchLocationsByName(searchQuery);
      setSearchResults(results);
      setShowDropdown(true);
      
      if (results.length === 0) {
        toast.info("No locations found. Try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for locations. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);
  
  /**
   * Handle selection of a location from search results
   * 
   * Updates weather with selected location data, adds to recent locations,
   * and resets the search UI state.
   * 
   * @param location - Location data from search results or saved locations
   */
  const handleLocationSelect = useCallback((location: LocationData | SavedLocation) => {
    // If it's a saved location, we need to access properties differently
    const locationName = 'displayName' in location 
      ? location.displayName 
      : `${location.name}, ${location.state ? `${location.state}, ` : ''}${location.country}`;
    
    // Call setLocation to update weather data
    setLocation(location.lat, location.lon, locationName);
    
    // Add to recent locations if it's a LocationData object
    if (!('displayName' in location)) {
      addToRecentLocations(location);
    }
    
    // Reset search
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    
    // Refresh saved locations
    loadSavedLocations();
  }, [loadSavedLocations, setLocation]);
  
  /**
   * Toggle favorite status for a location
   * 
   * Adds or removes a location from favorites and shows appropriate notification.
   * 
   * @param location - Location data to toggle favorite status for
   * @param e - Mouse event (used to stop propagation)
   */
  const handleToggleFavorite = useCallback((location: LocationData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    const newStatus = toggleLocationFavorite(location);
    
    if (newStatus) {
      toast.success(`Added ${location.name} to favorites`);
    } else {
      toast.info(`Removed ${location.name} from favorites`);
    }
    
    // Refresh favorites list
    loadSavedLocations();
  }, [loadSavedLocations]);
  
  /**
   * Remove a location from favorites
   * 
   * Deletes a location from favorites list and shows notification.
   * 
   * @param locationId - Unique identifier of the location to remove
   * @param displayName - Display name used for the notification message
   * @param e - Mouse event (used to stop propagation)
   */
  const handleRemoveLocation = useCallback((locationId: string, displayName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    removeFromFavoriteLocations(locationId);
    loadSavedLocations();
    toast.info(`Removed ${displayName} from favorites`);
  }, [loadSavedLocations]);
  
  /**
   * Handle click outside the dropdown to close it
   * 
   * Detects clicks outside the search dropdown and closes it.
   * 
   * @param e - Mouse event to check if click is outside dropdown
   */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  }, []);
  
  /* ===== Side Effects ===== */
  // Load saved locations on component mount
  useEffect(() => {
    loadSavedLocations();
  }, [loadSavedLocations]);
  
  // Add click outside listener to close dropdown
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);
  
  // Debounced search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);
  
  /* ===== Computed Values ===== */
  // Determine what to show in the search dropdown
  const showSearchResults = searchResults.length > 0;
  const showRecents = recentLocations.length > 0 && !showSearchResults && !searchQuery.trim();
  const showFavoritesDropdown = favoriteLocations.length > 0 && !showSearchResults && !searchQuery.trim();
  const showNoResults = searchQuery.trim() && searchResults.length === 0 && !isSearching;

  /**
   * Get the current page of hourly forecast data
   * 
   * @returns Array of hourly forecast items for the current page
   */
  const getCurrentHourlyPage = useCallback(() => {
    if (!weather || !weather.hourly) return [];
    
    const start = hourlyPage * hoursPerPage;
    const end = start + hoursPerPage;
    return weather.hourly.slice(start, end);
  }, [weather, hourlyPage, hoursPerPage]);
  
  /**
   * Handle navigation to next page of hourly forecast
   */
  const handleNextHourlyPage = useCallback(() => {
    if (!weather || !weather.hourly) return;
    
    const maxPage = Math.ceil(weather.hourly.length / hoursPerPage) - 1;
    setHourlyPage(prev => Math.min(prev + 1, maxPage));
  }, [weather, hoursPerPage]);
  
  /**
   * Handle navigation to previous page of hourly forecast
   */
  const handlePrevHourlyPage = useCallback(() => {
    setHourlyPage(prev => Math.max(prev - 1, 0));
  }, []);
  
  // Get current hourly forecast page
  const currentHourlyItems = getCurrentHourlyPage();
  // Calculate max page number
  const maxHourlyPage = weather?.hourly ? Math.ceil(weather.hourly.length / hoursPerPage) - 1 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ===== Info Panel ===== */}
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
          <div className="flex items-center text-sm text-muted-foreground mt-4">
            <InfoIcon className="w-4 h-4 mr-2" />
            <span>This is a portfolio project with real weather data.</span>
          </div>
        </section>
      )}

      {/* ===== Location Search ===== */}
      <section className="mb-4">
        <div className="w-full relative" ref={dropdownRef}>
          {/* Search input */}
          <div className="flex items-center border rounded-md bg-background">
            <div className="pl-3 text-muted-foreground">
              <Search size={18} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 py-2 px-3 bg-transparent outline-none"
              aria-label="Location search"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          
          {/* Dropdown for results, recents, and favorites */}
          {showDropdown && (
            <div className="absolute w-full mt-1 bg-background border rounded-md shadow-md z-50 max-h-80 overflow-y-auto">
              {/* Loading indicator */}
              {isSearching && (
                <div className="p-3">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              )}
              
              {/* Search results */}
              {showSearchResults && (
                <div>
                  <div className="p-2 text-sm font-semibold border-b">Search Results</div>
                  <ul>
                    {searchResults.map((location) => (
                      <li
                        key={location.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer flex justify-between items-center"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-center">
                          <MapPinIcon size={16} className="mr-2 text-primary" />
                          <span>
                            {location.name}
                            {location.state ? `, ${location.state}` : ""}, {location.country}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleToggleFavorite(location, e)}
                          aria-label={
                            isLocationFavorite(location.id)
                              ? `Remove ${location.name} from favorites`
                              : `Add ${location.name} to favorites`
                          }
                        >
                          <Star
                            size={16}
                            className={isLocationFavorite(location.id) ? "fill-yellow-400 text-yellow-400" : ""}
                          />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* No results indicator */}
              {showNoResults && (
                <div className="p-3 text-muted-foreground text-center">
                  No locations found for &quot;{searchQuery}&quot;
                </div>
              )}
              
              {/* Recent locations */}
              {showRecents && (
                <div>
                  <div className="p-2 text-sm font-semibold border-b">Recent Searches</div>
                  <ul>
                    {recentLocations.map((location) => (
                      <li
                        key={location.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <Clock size={16} className="mr-2 text-muted-foreground" />
                        <span>{location.displayName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Favorite locations in dropdown */}
              {showFavoritesDropdown && (
                <div>
                  <div className="p-2 text-sm font-semibold border-b">Favorites</div>
                  <ul>
                    {favoriteLocations.map((location) => (
                      <li
                        key={location.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <Star size={16} className="mr-2 fill-yellow-400 text-yellow-400" />
                        <span>{location.displayName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Empty dropdown state */}
              {!showSearchResults && !showRecents && !showFavoritesDropdown && !isSearching && !showNoResults && (
                <div className="p-3 text-muted-foreground text-center">
                  Type to search for a location
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ===== Location Display and Controls ===== */}
      <section className="my-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className={`text-primary ${isGettingLocation ? 'animate-pulse' : ''}`} />
            {loading ? (
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{location}</h2>
                <span className="text-xs text-muted-foreground animate-pulse">
                  {isGettingLocation ? "Detecting your location..." : "Loading weather data..."}
                </span>
              </div>
            ) : (
              <h2 className="text-2xl font-bold">{location}</h2>
            )}
          </div>
          
          <div className="flex gap-2 ml-auto flex-wrap justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFavorites(prev => !prev)}
              aria-label="Toggle favorites"
              className={showFavorites ? "bg-primary/10" : ""}
            >
              <StarIcon size={18} className={showFavorites ? "text-yellow-400" : ""} />
            </Button>
            {/* Only render the temperature unit button client-side to prevent hydration errors */}
            {isMounted ? (
              <Button variant="outline" onClick={toggleUnit} disabled={loading}>
                {unit === "metric" ? "Switch to °F" : "Switch to °C"}
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Loading...
              </Button>
            )}
            <Button onClick={getUserLocation} disabled={isGettingLocation}>
              {isGettingLocation ? "Detecting..." : "My Location"}
            </Button>
          </div>
        </div>
      </section>
      
      {/* ===== Favorites Panel ===== */}
      <section className="mb-6">
        {favoriteLocations.length === 0 && showFavorites ? (
          <div className="text-center p-4 border rounded-md bg-card">
            <Star className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No favorite locations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Search for locations and star them to add them to your favorites
            </p>
          </div>
        ) : showFavorites ? (
          <div className="border rounded-md bg-card overflow-hidden">
            <div className="p-3 border-b flex items-center">
              <Star className="text-yellow-400 mr-2" size={16} />
              <h3 className="font-medium">Favorite Locations</h3>
            </div>
            
            <ul className="divide-y">
              {favoriteLocations.map((location) => (
                <li
                  key={location.id}
                  className="p-3 hover:bg-accent cursor-pointer flex justify-between items-center"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-center">
                    <MapPinIcon size={16} className="mr-2 text-primary" />
                    <span>{location.displayName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleRemoveLocation(location.id, location.displayName, e)}
                    aria-label={`Remove ${location.displayName} from favorites`}
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* ===== Main Weather Content ===== */}
      <div className="grid grid-cols-1 gap-8">
        {/* Current Weather Card */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Current Weather</CardTitle>
            {!loading && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" 
                onClick={retryFetch}
                aria-label="Refresh weather data"
              >
                <RotateCw size={16} />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isPendingRequest || loading ? (
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
            ) : error && error.name !== 'AbortError' ? (
              <div className="p-6 text-center">
                <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
                  <AlertCircle />
                </div>
                <h3 className="font-medium mb-2">Failed to load weather data</h3>
                <p className="text-sm text-muted-foreground mb-4">{error.message || "Please check your connection."}</p>
                <Button onClick={retryFetch}>
                  <RotateCw size={16} className="mr-2" />
                  Retry
                </Button>
              </div>
            ) : weather ? (
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
            ) : (
              <div className="flex justify-center items-center p-8">
                <p className="text-muted-foreground">No weather data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Forecast Card */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle>Hourly Forecast</CardTitle>
            <div className="flex items-center gap-2">
              {!loading && !error && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" 
                  onClick={retryFetch}
                  aria-label="Refresh weather data"
                >
                  <RotateCw size={16} />
                </Button>
              )}
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevHourlyPage}
                  disabled={hourlyPage === 0 || loading || !weather || !!error}
                  aria-label="Previous hours"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="mx-2 text-sm text-muted-foreground">
                  {hourlyPage + 1}/{maxHourlyPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextHourlyPage}
                  disabled={hourlyPage >= maxHourlyPage || loading || !weather || !!error}
                  aria-label="Next hours"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isPendingRequest || loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
                {Array(6)
                  .fill(null)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-36 w-full" />
                  ))}
              </div>
            ) : error && error.name !== 'AbortError' ? (
              <div className="p-6 text-center">
                <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
                  <AlertCircle />
                </div>
                <h3 className="font-medium mb-2">Failed to load hourly forecast</h3>
                <p className="text-sm text-muted-foreground mb-4">{error.message || "Please check your connection."}</p>
                <Button onClick={retryFetch}>
                  <RotateCw size={16} className="mr-2" />
                  Retry
                </Button>
              </div>
            ) : weather ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
                {currentHourlyItems.map((hour, index) => (
                  <div 
                    key={index} 
                    className="forecast-hour p-3 rounded-lg border bg-card text-card-foreground transition-colors hover:bg-accent"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-center font-medium mb-2">{hour.formattedTime}</div>
                    <div className="flex justify-center mb-2">
                      <WeatherIcon condition={hour.icon} size="sm" />
                    </div>
                    <div className="text-center font-bold mb-1">
                      {displayTemp(hour.temp)}
                    </div>
                    <div className="text-xs text-center text-muted-foreground mb-2">
                      Feels like {displayTemp(hour.feels_like)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <Umbrella size={12} />
                        <span>{Math.round(hour.pop * 100)}%</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <WindIcon size={12} />
                        <span>{Math.round(hour.wind_speed)} km/h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center p-8">
                <p className="text-muted-foreground">No forecast data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5-Day Forecast Card */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>5-Day Forecast</CardTitle>
            {!loading && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" 
                onClick={retryFetch}
                aria-label="Refresh weather data"
              >
                <RotateCw size={16} />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isPendingRequest || loading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                {Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full" />
                  ))}
              </div>
            ) : error && error.name !== 'AbortError' ? (
              <div className="p-6 text-center">
                <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
                  <AlertCircle />
                </div>
                <h3 className="font-medium mb-2">Failed to load forecast data</h3>
                <p className="text-sm text-muted-foreground mb-4">{error.message || "Please check your connection."}</p>
                <Button onClick={retryFetch}>
                  <RotateCw size={16} className="mr-2" />
                  Retry
                </Button>
              </div>
            ) : weather ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                {weather.forcast.map((day, index) => (
                  <div key={index} className="forecast-day" style={{
                    animationDelay: `${index * 100}ms`
                  }}>
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
            ) : (
              <div className="flex justify-center items-center p-8">
                <p className="text-muted-foreground">No forecast data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}