import { getCurrentWeather } from '../weather';

// Mock fetch
global.fetch = jest.fn();

describe('Weather Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch weather data from the API', async () => {
      const mockWeatherData = {
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        timestamp: new Date().toISOString(),
        temperatureTrend: 'stable',
      };

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockWeatherData),
      });

      const result = await getCurrentWeather();

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/weather');
      
      // Verify returned data
      expect(result).toEqual(mockWeatherData);
    });

    it('should throw an error when the API request fails', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getCurrentWeather()).rejects.toThrow(
        'Failed to fetch weather data: 500 Internal Server Error'
      );
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(getCurrentWeather()).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      // Mock API response with invalid JSON
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(getCurrentWeather()).rejects.toThrow('Invalid JSON');
    });
  });
});