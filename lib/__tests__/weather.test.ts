import { getCurrentWeather } from '../weather';

// Mock the fetch function
global.fetch = jest.fn();

describe('Weather Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch weather data from the API', async () => {
      // Mock successful API response
      const mockWeatherData = {
        temperature: 85,
        description: 'clear sky',
        humidity: 30,
        windSpeed: 5.2,
        condition: 'Clear',
        timestamp: '2023-06-15T10:30:00Z',
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockWeatherData),
      });

      const result = await getCurrentWeather();

      expect(fetch).toHaveBeenCalledWith('/api/weather');
      expect(result).toEqual(mockWeatherData);
    });

    it('should throw an error when the API call fails', async () => {
      // Mock failed API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getCurrentWeather()).rejects.toThrow('Failed to fetch weather data: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getCurrentWeather()).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON responses', async () => {
      // Mock API returning invalid JSON
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(getCurrentWeather()).rejects.toThrow('Invalid JSON');
    });
  });
});