import { render, screen, waitFor } from '@testing-library/react';
import { WeatherDisplay } from '../weather-display';
import { getCurrentWeather } from '@/lib/weather';

// Mock the weather library
jest.mock('@/lib/weather');

// Mock the TemperatureTrend component
jest.mock('../temperature-trend', () => ({
  TemperatureTrend: ({ trend }: { trend: string }) => (
    <div data-testid="temperature-trend" data-trend={trend}>
      Mocked Temperature Trend
    </div>
  ),
}));

describe('WeatherDisplay', () => {
  const mockWeatherData = {
    temperature: 65,
    description: 'partly cloudy',
    humidity: 65,
    windSpeed: 5.2,
    condition: 'Clouds',
    timestamp: new Date().toISOString(),
    temperatureTrend: 'rising' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    // Act
    render(<WeatherDisplay />);

    // Assert
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  it('should render weather data with temperature trend when loaded successfully', async () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);

    // Act
    render(<WeatherDisplay />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Current Armonk Weather')).toBeInTheDocument();
      expect(screen.getByText('65°F')).toBeInTheDocument();
      expect(screen.getByText('partly cloudy')).toBeInTheDocument();
      
      // Check that temperature trend component is rendered with correct props
      const trendElement = screen.getByTestId('temperature-trend');
      expect(trendElement).toBeInTheDocument();
      expect(trendElement).toHaveAttribute('data-trend', 'rising');
    });
  });

  it('should render error state when API returns an error', async () => {
    // Arrange
    const errorData = {
      ...mockWeatherData,
      isFallback: true,
      error: 'Failed to fetch weather data'
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(errorData);

    // Act
    render(<WeatherDisplay />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Weather Data Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument();
      expect(screen.getByText('Using fallback data')).toBeInTheDocument();
    });
  });

  it('should not render temperature trend when trend data is missing', async () => {
    // Arrange
    const weatherDataWithoutTrend = {
      ...mockWeatherData,
      temperatureTrend: undefined
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(weatherDataWithoutTrend);

    // Act
    render(<WeatherDisplay />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('65°F')).toBeInTheDocument();
      expect(screen.queryByTestId('temperature-trend')).not.toBeInTheDocument();
    });
  });

  it('should render different weather icons based on condition', async () => {
    // Test different weather conditions
    const conditions = [
      { condition: 'Clear', expectIcon: 'sun' },
      { condition: 'Clouds', expectIcon: 'cloud' },
      { condition: 'Rain', expectIcon: 'cloud-rain' },
    ];

    for (const { condition, expectIcon } of conditions) {
      // Arrange
      (getCurrentWeather as jest.Mock).mockResolvedValue({
        ...mockWeatherData,
        condition
      });

      // Act
      const { unmount } = render(<WeatherDisplay />);

      // Assert
      await waitFor(() => {
        const iconElement = document.querySelector(`[data-lucide="${expectIcon}"]`);
        expect(iconElement).toBeInTheDocument();
      });

      unmount();
    }
  });
});