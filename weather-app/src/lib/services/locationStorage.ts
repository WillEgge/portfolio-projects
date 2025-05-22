import type { SavedLocation, LocationData } from "@/lib/types";
import { formatLocationDisplay } from "@/lib/api/weather";

// Constants
const RECENT_LOCATIONS_KEY = "weather_app_recent_locations";
const FAVORITE_LOCATIONS_KEY = "weather_app_favorite_locations";
const MAX_RECENT_LOCATIONS = 5;

/**
 * Storage service for managing recent and favorite locations
 * 
 * Provides methods to:
 * - Add locations to recent or favorites
 * - Remove locations from recent or favorites
 * - Retrieve recent and favorite locations
 * - Check if a location is a favorite
 * 
 * Uses localStorage for persistence
 */

/**
 * Save a location to recent searches
 * 
 * @param location - The location data to save
 */
export const addToRecentLocations = (location: LocationData): void => {
  try {
    // Get current recent locations
    const recentLocations = getRecentLocations();
    
    // Create a saved location object
    const savedLocation: SavedLocation = {
      id: location.id,
      displayName: formatLocationDisplay(location),
      lat: location.lat,
      lon: location.lon,
      timestamp: new Date().toISOString()
    };
    
    // Remove the location if it already exists to avoid duplicates
    const filteredLocations = recentLocations.filter(loc => loc.id !== location.id);
    
    // Add the new location at the beginning of the array
    const updatedLocations = [savedLocation, ...filteredLocations];
    
    // Limit to the maximum number of recent locations
    const limitedLocations = updatedLocations.slice(0, MAX_RECENT_LOCATIONS);
    
    // Save to localStorage
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(limitedLocations));
  } catch (error) {
    console.error("Error saving recent location:", error);
  }
};

/**
 * Get all recent locations from storage
 * 
 * @returns Array of saved locations, sorted by most recent first
 */
export const getRecentLocations = (): SavedLocation[] => {
  try {
    const storedLocations = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!storedLocations) {
      return [];
    }
    
    return JSON.parse(storedLocations);
  } catch (error) {
    console.error("Error getting recent locations:", error);
    return [];
  }
};

/**
 * Remove a location from recent searches
 * 
 * @param locationId - The ID of the location to remove
 */
export const removeFromRecentLocations = (locationId: string): void => {
  try {
    const recentLocations = getRecentLocations();
    const updatedLocations = recentLocations.filter(loc => loc.id !== locationId);
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updatedLocations));
  } catch (error) {
    console.error("Error removing recent location:", error);
  }
};

/**
 * Save a location to favorites
 * 
 * @param location - The location data to save as a favorite
 */
export const addToFavoriteLocations = (location: LocationData): void => {
  try {
    // Get current favorite locations
    const favoriteLocations = getFavoriteLocations();
    
    // Create a saved location object
    const savedLocation: SavedLocation = {
      id: location.id,
      displayName: formatLocationDisplay(location),
      lat: location.lat,
      lon: location.lon,
      timestamp: new Date().toISOString()
    };
    
    // Check if the location is already a favorite
    if (favoriteLocations.some(loc => loc.id === location.id)) {
      return; // Already a favorite, no need to add again
    }
    
    // Add the new location to favorites
    const updatedLocations = [...favoriteLocations, savedLocation];
    
    // Save to localStorage
    localStorage.setItem(FAVORITE_LOCATIONS_KEY, JSON.stringify(updatedLocations));
  } catch (error) {
    console.error("Error saving favorite location:", error);
  }
};

/**
 * Get all favorite locations from storage
 * 
 * @returns Array of saved favorite locations
 */
export const getFavoriteLocations = (): SavedLocation[] => {
  try {
    const storedLocations = localStorage.getItem(FAVORITE_LOCATIONS_KEY);
    if (!storedLocations) {
      return [];
    }
    
    return JSON.parse(storedLocations);
  } catch (error) {
    console.error("Error getting favorite locations:", error);
    return [];
  }
};

/**
 * Remove a location from favorites
 * 
 * @param locationId - The ID of the location to remove from favorites
 */
export const removeFromFavoriteLocations = (locationId: string): void => {
  try {
    const favoriteLocations = getFavoriteLocations();
    const updatedLocations = favoriteLocations.filter(loc => loc.id !== locationId);
    localStorage.setItem(FAVORITE_LOCATIONS_KEY, JSON.stringify(updatedLocations));
  } catch (error) {
    console.error("Error removing favorite location:", error);
  }
};

/**
 * Check if a location is marked as a favorite
 * 
 * @param locationId - The ID of the location to check
 * @returns Boolean indicating whether the location is a favorite
 */
export const isLocationFavorite = (locationId: string): boolean => {
  const favoriteLocations = getFavoriteLocations();
  return favoriteLocations.some(loc => loc.id === locationId);
};

/**
 * Toggle a location's favorite status
 * 
 * @param location - The location data to toggle favorite status for
 * @returns The new favorite status (true if favorited, false if unfavorited)
 */
export const toggleLocationFavorite = (location: LocationData): boolean => {
  const isFavorite = isLocationFavorite(location.id);
  
  if (isFavorite) {
    removeFromFavoriteLocations(location.id);
    return false;
  } else {
    addToFavoriteLocations(location);
    return true;
  }
};