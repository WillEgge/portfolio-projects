import { 
  searchLocationsByName, 
  formatLocationDisplay, 
  getWeatherFromCoords,
  getCurrentPosition 
} from '@/lib/api/weather';
import type { LocationData } from '@/lib/types';

// Mock the fetch function
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Weather API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchLocationsByName', () => {
    const mockLocationData = [
      {
        name: 'New York',
        state: 'NY',
        country: 'US',
        lat: 40.7128,
        lon: -74.0060
      },
      {
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278
      }
    ];

    it('should return formatted location data when API call is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocationData,
      } as Response);

      const result = await searchLocationsByName('New York');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openweathermap.org/geo/1.0/direct?q=New%20York&limit=5&appid=test-api-key'
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: expect.stringContaining('NewYork_NY_US'),
        name: 'New York',
        state: 'NY',
        country: 'US',
        lat: 40.7128,
        lon: -74.0060
      });
    });

    it('should return empty array for empty query', async () => {
      const result = await searchLocationsByName('');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(searchLocationsByName('InvalidCity')).rejects.toThrow('Failed to search for locations');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(searchLocationsByName('Test')).rejects.toThrow('Failed to search for locations');
    });
  });

  describe('formatLocationDisplay', () => {
    it('should format location with state correctly', () => {
      const location: LocationData = {
        id: 'test-id',
        name: 'New York',
        state: 'NY',
        country: 'US',
        lat: 40.7128,
        lon: -74.0060
      };

      const result = formatLocationDisplay(location);
      expect(result).toBe('New York, NY, US');
    });

    it('should format location without state correctly', () => {
      const location: LocationData = {
        id: 'test-id',
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278
      };

      const result = formatLocationDisplay(location);
      expect(result).toBe('London, GB');
    });
  });

  describe('getWeatherFromCoords', () => {
    const mockCurrentWeather = {
      name: 'New York',
      main: {
        temp: 20,
        feels_like: 22,
        humidity: 65,
      },
      wind: {
        speed: 10,
      },
      weather: [{
        main: 'Clear',
        id: 800,
      }],
    };

    const mockForecastData = {
      list: [
        {
          dt: 1640995200, // Mock timestamp
          main: { temp: 18, feels_like: 20, humidity: 60 },
          wind: { speed: 8 },
          weather: [{ id: 800, description: 'clear sky' }],
          pop: 0.1,
        },
      ],
    };

    it('should fetch and format weather data correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrentWeather,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockForecastData,
        } as Response);

      const result = await getWeatherFromCoords(40.7128, -74.0060);

      expect(result).toEqual({
        location: 'New York',
        current: {
          temp: 20,
          feels_like: 22,
          humidity: 65,
          wind_speed: 10,
          weather: 'Clear',
          icon: 'sun',
        },
        forcast: expect.any(Array),
        hourly: expect.any(Array),
      });
    });

    it('should handle current weather API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(getWeatherFromCoords(40.7128, -74.0060)).rejects.toThrow(
        'Failed to fetch current weather data'
      );
    });

    it('should handle forecast API failure', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrentWeather,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response);

      await expect(getWeatherFromCoords(40.7128, -74.0060)).rejects.toThrow(
        'Failed to fetch forecast data'
      );
    });
  });

  describe('getCurrentPosition', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };

    beforeEach(() => {
      (global.navigator as any).geolocation = mockGeolocation;
    });

    it('should resolve with position when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      const result = await getCurrentPosition();
      expect(result).toBe(mockPosition);
    });

    it('should reject when geolocation fails', async () => {
      const mockError = new Error('Location access denied');

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
        error(mockError);
      });

      await expect(getCurrentPosition()).rejects.toThrow('Location access denied');
    });

    it('should reject when geolocation is not supported', async () => {
      (global.navigator as any).geolocation = undefined;

      await expect(getCurrentPosition()).rejects.toThrow(
        'Geolocation is not supported by your browser'
      );
    });
  });
});