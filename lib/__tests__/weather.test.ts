import { getCurrentWeather, checkWeather } from '../weather';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console methods
console.warn = jest.fn();
console.error = jest.fn();

describe('Weather Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('getCurrentWeather', () => {
    it('should fetch weather data from the API and return the response', async () => {
      // Arrange
      const mockWeatherData = {
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        timestamp: new Date().toISOString(),
        temperatureTrend: 'stable'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockWeatherData)
      });

      // Act
      const result = await getCurrentWeather();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith('/api/weather', expect.any(Object));
      expect(result).toEqual(mockWeatherData);
    });

    it('should log a warning but not throw when API returns an error with fallback data', async () => {
      // Arrange
      const mockErrorData = {
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        timestamp: new Date().toISOString(),
        isFallback: true,
        error: 'API error occurred'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockErrorData)
      });

      // Act
      const result = await getCurrentWeather();

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Weather API warning: API error occurred');
      expect(result).toEqual(mockErrorData);
    });

    it('should throw an error when the API response is not ok', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // Act & Assert
      await expect(getCurrentWeather()).rejects.toThrow('Failed to fetch weather data: 500');
    });

    it('should handle and log fetch errors', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(getCurrentWeather()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Error fetching current weather:', networkError);
    });
  });

  describe('checkWeather', () => {
    it('should detect rain and reset the counter when condition includes "rain"', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const mockWeatherData = {
        condition: 'Rain',
        description: 'light rain',
        temperature: 55
      };

      // Mock getCurrentWeather to return rainy conditions
      jest.spyOn(global, 'getCurrentWeather').mockResolvedValueOnce(mockWeatherData as any);

      // Set previous rain data (3 days ago)
      localStorageMock.setItem('seattleRainData', JSON.stringify({
        lastRainDate: '2023-01-01',
        daysSinceRain: 3
      }));

      // Act
      const result = await checkWeather();

      // Assert
      expect(result).toEqual({
        isRaining: true,
        lastRainDate: today,
        daysSinceRain: 0,
        isFallback: false,
        error: undefined
      });

      // Check localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'seattleRainData',
        expect.stringContaining(`"lastRainDate":"${today}"`) 
      );
    });

    it('should increment the counter when not raining and last check was not today', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const mockWeatherData = {
        condition: 'Clear',
        description: 'clear sky',
        temperature: 70
      };

      // Mock getCurrentWeather to return clear conditions
      jest.spyOn(global, 'getCurrentWeather').mockResolvedValueOnce(mockWeatherData as any);

      // Set previous rain data (last rain 5 days ago)
      localStorageMock.setItem('seattleRainData', JSON.stringify({
        lastRainDate: '2023-01-01',
        daysSinceRain: 5
      }));

      // Act
      const result = await checkWeather();

      // Assert
      expect(result).toEqual({
        isRaining: false,
        lastRainDate: '2023-01-01',
        daysSinceRain: 6, // Incremented by 1
        isFallback: false,
        error: undefined
      });

      // Check localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'seattleRainData',
        expect.stringContaining('"daysSinceRain":6')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lastCheckedDate', today);
    });

    it('should not increment the counter if already checked today', async () => {
      // Arrange
      const today = new Date().toISOString().split('T')[0];
      const mockWeatherData = {
        condition: 'Clear',
        description: 'clear sky',
        temperature: 70
      };

      // Mock getCurrentWeather to return clear conditions
      jest.spyOn(global, 'getCurrentWeather').mockResolvedValueOnce(mockWeatherData as any);

      // Set previous rain data
      localStorageMock.setItem('seattleRainData', JSON.stringify({
        lastRainDate: '2023-01-01',
        daysSinceRain: 5
      }));
      
      // Set that we already checked today
      localStorageMock.setItem('lastCheckedDate', today);

      // Act
      const result = await checkWeather();

      // Assert
      expect(result).toEqual({
        isRaining: false,
        lastRainDate: '2023-01-01',
        daysSinceRain: 5, // Not incremented
        isFallback: false,
        error: undefined
      });
    });

    it('should handle errors and return stored data', async () => {
      // Arrange
      const error = new Error('API error');
      jest.spyOn(global, 'getCurrentWeather').mockRejectedValueOnce(error);

      // Set previous rain data
      localStorageMock.setItem('seattleRainData', JSON.stringify({
        lastRainDate: '2023-01-01',
        daysSinceRain: 5
      }));

      // Act
      const result = await checkWeather();

      // Assert
      expect(result).toEqual({
        isRaining: false,
        lastRainDate: '2023-01-01',
        daysSinceRain: 5,
        error: 'API error'
      });
      expect(console.error).toHaveBeenCalledWith('Error checking rain status:', error);
    });

    it('should return default values when no stored data exists', async () => {
      // Arrange
      const mockWeatherData = {
        condition: 'Clear',
        description: 'clear sky',
        temperature: 70
      };

      // Mock getCurrentWeather to return clear conditions
      jest.spyOn(global, 'getCurrentWeather').mockResolvedValueOnce(mockWeatherData as any);

      // No stored data in localStorage

      // Act
      const result = await checkWeather();

      // Assert
      expect(result).toEqual({
        isRaining: false,
        lastRainDate: null,
        daysSinceRain: 0,
        isFallback: false,
        error: undefined
      });
    });
  });
});