import { NextResponse } from 'next/server';
import { GET } from '../route';

// Mock the fetch function
global.fetch = jest.fn();

// Mock environment variables
process.env.OPENWEATHER_API_KEY = 'test-api-key';

describe('Weather API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('GET', () => {
    it('should return weather data with temperature trend when API call succeeds', async () => {
      // Arrange
      const mockWeatherData = {
        main: {
          temp: 65,
          feels_like: 68,
          humidity: 65
        },
        weather: [{
          main: 'Clouds',
          description: 'partly cloudy'
        }],
        wind: {
          speed: 5.2
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockWeatherData)
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
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        timestamp: expect.any(String),
        temperatureTrend: 'rising'
      });
    });

    it('should calculate temperature trend correctly based on feels_like vs actual temp', async () => {
      // Test cases for different temperature trends
      const testCases = [
        { temp: 65, feels_like: 68, expected: 'rising' },
        { temp: 65, feels_like: 62, expected: 'falling' },
        { temp: 65, feels_like: 65, expected: 'stable' }
      ];

      for (const testCase of testCases) {
        // Arrange
        const mockWeatherData = {
          main: {
            temp: testCase.temp,
            feels_like: testCase.feels_like,
            humidity: 65
          },
          weather: [{
            main: 'Clouds',
            description: 'partly cloudy'
          }],
          wind: {
            speed: 5.2
          }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockWeatherData)
        });

        // Act
        const response = await GET();
        const responseData = await response.json();

        // Assert
        expect(responseData.temperatureTrend).toBe(testCase.expected);
      }
    });

    it('should return fallback data when API call fails', async () => {
      // Arrange
      const errorMessage = 'API error';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValueOnce(errorMessage)
      });

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(responseData).toEqual(expect.objectContaining({
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        isFallback: true,
        temperatureTrend: 'stable',
        error: expect.any(String)
      }));
    });

    it('should handle exceptions during API call using the handleError function', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(console.error).toHaveBeenCalledWith('API error:', networkError);
      expect(responseData).toEqual(expect.objectContaining({
        temperature: 65,
        description: 'partly cloudy',
        humidity: 65,
        windSpeed: 5.2,
        condition: 'Clouds',
        isFallback: true,
        temperatureTrend: 'stable',
        error: 'Network error'
      }));
    });
  });
});