import { render, screen, waitFor } from '@testing-library/react';
import { WeatherDisplay } from '../weather-display';
import { getCurrentWeather } from '@/lib/weather';

// Mock the weather library
jest.mock('@/lib/weather', () => ({
  getCurrentWeather: jest.fn(),
}));

// Mock the TemperatureTrend component
jest.mock('../temperature-trend', () => ({
  TemperatureTrend: ({ trend }: { trend: string }) => <div data-testid="temperature-trend">{trend}</div>,
}));

describe('WeatherDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    render(<WeatherDisplay />);
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  it('should render weather data correctly when loaded', async () => {
    const mockWeatherData = {
      temperature: 65,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 5.2,
      condition: 'Clouds',
      timestamp: new Date().toISOString(),
      temperatureTrend: 'rising' as const,
    };

    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);

    render(<WeatherDisplay />);

    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('65°F')).toBeInTheDocument();
    expect(screen.getByText('partly cloudy')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 65%')).toBeInTheDocument();
    expect(screen.getByText('Wind: 5.2 mph')).toBeInTheDocument();
    expect(screen.getByTestId('temperature-trend')).toHaveTextContent('rising');
  });

  it('should display error message when API fails', async () => {
    (getCurrentWeather as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<WeatherDisplay />);

    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Error loading weather data')).toBeInTheDocument();
  });

  it('should show fallback data indicator when API returns fallback data', async () => {
    const mockFallbackData = {
      temperature: 65,
      description: 'partly cloudy',
      humidity: 65,
      windSpeed: 5.2,
      condition: 'Clouds',
      timestamp: new Date().toISOString(),
      isFallback: true,
    };

    (getCurrentWeather as jest.Mock).mockResolvedValue(mockFallbackData);

    render(<WeatherDisplay />);

    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Using fallback data')).toBeInTheDocument();
  });
});