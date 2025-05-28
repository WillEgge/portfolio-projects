import {
  addToRecentLocations,
  getRecentLocations,
  removeFromRecentLocations,
  addToFavoriteLocations,
  getFavoriteLocations,
  removeFromFavoriteLocations,
  isLocationFavorite,
  toggleLocationFavorite,
} from '@/lib/services/locationStorage';
import type { LocationData } from '@/lib/types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Location Storage Service', () => {
  const mockLocation: LocationData = {
    id: 'new-york-ny-us',
    name: 'New York',
    state: 'NY',
    country: 'US',
    lat: 40.7128,
    lon: -74.0060,
  };

  const mockLocation2: LocationData = {
    id: 'london-gb',
    name: 'London',
    country: 'GB',
    lat: 51.5074,
    lon: -0.1278,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Recent Locations', () => {
    describe('getRecentLocations', () => {
      it('should return empty array when no data in localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        
        const result = getRecentLocations();
        
        expect(result).toEqual([]);
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('weather_app_recent_locations');
      });

      it('should return parsed locations from localStorage', () => {
        const mockData = [
          {
            id: 'test-id',
            displayName: 'Test Location',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = getRecentLocations();
        
        expect(result).toEqual(mockData);
      });

      it('should handle JSON parse errors gracefully', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid json');
        
        const result = getRecentLocations();
        
        expect(result).toEqual([]);
      });
    });

    describe('addToRecentLocations', () => {
      it('should add a new location to recent locations', () => {
        mockLocalStorage.getItem.mockReturnValue('[]');

        addToRecentLocations(mockLocation);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'weather_app_recent_locations',
          expect.stringContaining('"id":"new-york-ny-us"')
        );
      });

      it('should move existing location to the top of the list', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'london-gb',
            displayName: 'London, GB',
            lat: 51.5074,
            lon: -0.1278,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        addToRecentLocations(mockLocation);

        // Should be called with the location moved to the top
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'weather_app_recent_locations',
          expect.stringMatching(/.*new-york-ny-us.*london-gb.*/)
        );
      });

      it('should limit recent locations to maximum count', () => {
        // Create 5 existing locations
        const existingData = Array.from({ length: 5 }, (_, i) => ({
          id: `location-${i}`,
          displayName: `Location ${i}`,
          lat: 40.7128,
          lon: -74.0060,
          timestamp: '2023-01-01T00:00:00.000Z',
        }));

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        addToRecentLocations(mockLocation);

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData).toHaveLength(5); // Should still be 5 (max limit)
        expect(savedData[0].id).toBe('new-york-ny-us'); // New location should be first
      });
    });

    describe('removeFromRecentLocations', () => {
      it('should remove a location from recent locations', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'london-gb',
            displayName: 'London, GB',
            lat: 51.5074,
            lon: -0.1278,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        removeFromRecentLocations('new-york-ny-us');

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData).toHaveLength(1);
        expect(savedData[0].id).toBe('london-gb');
      });
    });
  });

  describe('Favorite Locations', () => {
    describe('getFavoriteLocations', () => {
      it('should return empty array when no data in localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        
        const result = getFavoriteLocations();
        
        expect(result).toEqual([]);
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('weather_app_favorite_locations');
      });

      it('should return parsed favorite locations from localStorage', () => {
        const mockData = [
          {
            id: 'test-id',
            displayName: 'Test Location',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

        const result = getFavoriteLocations();
        
        expect(result).toEqual(mockData);
      });
    });

    describe('addToFavoriteLocations', () => {
      it('should add a new location to favorites', () => {
        mockLocalStorage.getItem.mockReturnValue('[]');

        addToFavoriteLocations(mockLocation);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'weather_app_favorite_locations',
          expect.stringContaining('"id":"new-york-ny-us"')
        );
      });

      it('should not add duplicate locations to favorites', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        addToFavoriteLocations(mockLocation);

        // Should not save anything since it's already a favorite
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      });
    });

    describe('removeFromFavoriteLocations', () => {
      it('should remove a location from favorites', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'london-gb',
            displayName: 'London, GB',
            lat: 51.5074,
            lon: -0.1278,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        removeFromFavoriteLocations('new-york-ny-us');

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData).toHaveLength(1);
        expect(savedData[0].id).toBe('london-gb');
      });
    });

    describe('isLocationFavorite', () => {
      it('should return true if location is in favorites', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        const result = isLocationFavorite('new-york-ny-us');
        
        expect(result).toBe(true);
      });

      it('should return false if location is not in favorites', () => {
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = isLocationFavorite('new-york-ny-us');
        
        expect(result).toBe(false);
      });
    });

    describe('toggleLocationFavorite', () => {
      it('should add location to favorites if not already favorited', () => {
        mockLocalStorage.getItem.mockReturnValue('[]');

        const result = toggleLocationFavorite(mockLocation);

        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'weather_app_favorite_locations',
          expect.stringContaining('"id":"new-york-ny-us"')
        );
      });

      it('should remove location from favorites if already favorited', () => {
        const existingData = [
          {
            id: 'new-york-ny-us',
            displayName: 'New York, NY, US',
            lat: 40.7128,
            lon: -74.0060,
            timestamp: '2023-01-01T00:00:00.000Z',
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

        const result = toggleLocationFavorite(mockLocation);

        expect(result).toBe(false);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'weather_app_favorite_locations',
          '[]'
        );
      });
    });
  });
});