import { GET } from '../route';
import { NextResponse } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

// Mock console.log and console.error to avoid cluttering test output
console.log = jest.fn();
console.error = jest.fn();

// Mock environment variables
process.env.OPENWEATHER_API_KEY = 'test-api-key';

describe('Weather API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET function', () => {
    it('should return weather data when API call succeeds', async () => {
      // Arrange
      const mockWeatherData = {
        main: {
          temp: 85,
          humidity: 30,
          feels_like: 87
        },
        weather: [{
          main: 'Clear',
          description: 'clear sky'
        }],
        wind: {
          speed: 5.2
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org/data/2.5/weather'),
        expect.any(Object)
      );
      expect(responseData).toEqual({
        temperature: 85,
        description: 'clear sky',
        humidity: 30,
        windSpeed: 5.2,
        condition: 'Clear',
        timestamp: expect.any(String),
        temperatureTrend: 'rising'
      });
    });

    it('should calculate temperature trend correctly based on feels_like vs actual temp', async () => {
      // Arrange - Rising trend
      const mockRisingTrend = {
        main: { temp: 85, humidity: 30, feels_like: 87 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5.2 }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRisingTrend
      });

      // Act - Rising trend
      const risingResponse = await GET();
      const risingData = await risingResponse.json();

      // Assert - Rising trend
      expect(risingData.temperatureTrend).toBe('rising');

      // Arrange - Falling trend
      const mockFallingTrend = {
        main: { temp: 85, humidity: 30, feels_like: 83 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5.2 }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFallingTrend
      });

      // Act - Falling trend
      const fallingResponse = await GET();
      const fallingData = await fallingResponse.json();

      // Assert - Falling trend
      expect(fallingData.temperatureTrend).toBe('falling');

      // Arrange - Stable trend
      const mockStableTrend = {
        main: { temp: 85, humidity: 30, feels_like: 85 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5.2 }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStableTrend
      });

      // Act - Stable trend
      const stableResponse = await GET();
      const stableData = await stableResponse.json();

      // Assert - Stable trend
      expect(stableData.temperatureTrend).toBe('stable');
    });

    it('should return fallback data when API call fails with error response', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key'
      });

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(responseData).toEqual(expect.objectContaining({
        temperature: 85,
        description: 'clear sky',
        humidity: 30,
        windSpeed: 5.2,
        condition: 'Clear',
        isFallback: true,
        temperatureTrend: 'stable',
        error: expect.any(String)
      }));
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle exceptions during API call using the handleError function', async () => {
      // Arrange
      const testError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(testError);

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(responseData).toEqual(expect.objectContaining({
        temperature: 85,
        description: 'clear sky',
        humidity: 30,
        windSpeed: 5.2,
        condition: 'Clear',
        isFallback: true,
        temperatureTrend: 'stable',
        error: 'Network error'
      }));
      expect(console.error).toHaveBeenCalledWith('API error:', testError);
    });
  });
});