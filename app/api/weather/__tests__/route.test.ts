import { GET } from '../route';
import { NextResponse } from 'next/server';

// Mock the fetch function
global.fetch = jest.fn();

// Mock console.error to prevent test output pollution
console.error = jest.fn();

// Mock environment variables
process.env.OPENWEATHER_API_KEY = 'test-api-key';

describe('Weather API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET function', () => {
    it('should return weather data when API call is successful', async () => {
      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          main: { temp: 85, humidity: 30 },
          weather: [{ description: 'clear sky', main: 'Clear' }],
          wind: { speed: 5.2 }
        })
      });

      const response = await GET();
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org/data/2.5/weather'),
        expect.any(Object)
      );
      expect(data).toEqual({
        temperature: 85,
        description: 'clear sky',
        humidity: 30,
        windSpeed: 5.2,
        condition: 'Clear',
        timestamp: expect.any(String)
      });
    });

    it('should return fallback data when API key is missing', async () => {
      // Temporarily remove API key
      const originalKey = process.env.OPENWEATHER_API_KEY;
      delete process.env.OPENWEATHER_API_KEY;

      const response = await GET();
      const data = await response.json();

      expect(fetch).not.toHaveBeenCalled();
      expect(data).toEqual({
        ...FALLBACK_DATA,
        error: 'API key not available',
        timestamp: expect.any(String),
        isFallback: true
      });

      // Restore API key
      process.env.OPENWEATHER_API_KEY = originalKey;
    });

    it('should return fallback data when API returns an error', async () => {
      // Mock failed API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValueOnce('Invalid API key')
      });

      const response = await GET();
      const data = await response.json();

      expect(fetch).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(data).toEqual({
        ...FALLBACK_DATA,
        error: expect.stringContaining('Weather API error'),
        timestamp: expect.any(String),
        isFallback: true
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        ...FALLBACK_DATA,
        error: 'Network error',
        timestamp: expect.any(String),
        isFallback: true
      });
    });

    it('should handle unexpected error types', async () => {
      // Mock a non-Error object being thrown
      (fetch as jest.Mock).mockRejectedValueOnce('Unexpected error');

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual({
        ...FALLBACK_DATA,
        error: 'Failed to fetch weather data',
        timestamp: expect.any(String),
        isFallback: true
      });
    });
  });
});

// Define the fallback data for testing
const FALLBACK_DATA = {
  temperature: 85,
  description: 'clear sky',
  humidity: 30,
  windSpeed: 5.2,
  condition: 'Clear',
  timestamp: expect.any(String),
  isFallback: true,
};