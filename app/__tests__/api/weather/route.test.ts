import { GET } from '@/app/api/weather/route';
import { NextResponse } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

// Mock environment variables
process.env.OPENWEATHER_API_KEY = 'test-api-key';

// Mock console.log and console.error to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Weather API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should fetch weather data and return formatted response', async () => {
    const mockApiResponse = {
      main: {
        temp: 72.5,
        feels_like: 75.2,
        humidity: 65
      },
      weather: [{
        main: 'Clouds',
        description: 'scattered clouds'
      }],
      wind: {
        speed: 8.5
      }
    };

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockApiResponse)
    });

    const response = await GET();
    const data = await response.json();

    // Verify API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openweathermap.org/data/2.5/weather'),
      expect.any(Object)
    );

    // Verify response format
    expect(data).toEqual({
      temperature: 72.5,
      description: 'scattered clouds',
      humidity: 65,
      windSpeed: 8.5,
      condition: 'Clouds',
      timestamp: expect.any(String),
      temperatureTrend: 'rising'
    });
  });

  it('should calculate temperature trend correctly', async () => {
    // Test rising trend
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        main: { temp: 70, feels_like: 75, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5 }
      })
    });

    let response = await GET();
    let data = await response.json();
    expect(data.temperatureTrend).toBe('rising');

    // Test falling trend
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        main: { temp: 70, feels_like: 65, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5 }
      })
    });

    response = await GET();
    data = await response.json();
    expect(data.temperatureTrend).toBe('falling');

    // Test stable trend
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        main: { temp: 70, feels_like: 70, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5 }
      })
    });

    response = await GET();
    data = await response.json();
    expect(data.temperatureTrend).toBe('stable');
  });

  it('should return fallback data when API returns error', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValueOnce('Invalid API key')
    });

    const response = await GET();
    const data = await response.json();

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();

    // Verify fallback data was returned
    expect(data).toEqual(expect.objectContaining({
      temperature: 65,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 5.2,
      condition: 'Clouds',
      isFallback: true,
      error: expect.any(String)
    }));
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    const networkError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const response = await GET();
    const data = await response.json();

    // Verify error handling
    expect(data).toEqual(expect.objectContaining({
      isFallback: true,
      error: 'Network error'
    }));
  });
});