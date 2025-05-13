import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WeatherDisplay } from '../weather-display';
import { getCurrentWeather } from '@/lib/weather';
import { TemperatureTrend } from '../temperature-trend';

// Mock the imported modules
jest.mock('@/lib/weather');
jest.mock('../temperature-trend', () => ({
  TemperatureTrend: jest.fn(() => <div data-testid="temperature-trend-mock">Mocked Trend</div>)
}));

describe('WeatherDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    // Act
    render(<WeatherDisplay />);
    
    // Assert
    expect(screen.getByText('Loading weather...')).toBeInTheDocument();
  });

  it('should render weather data when loaded successfully', async () => {
    // Arrange
    const mockWeatherData = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: new Date().toISOString(),
      temperatureTrend: 'rising' as const
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);
    
    // Act
    render(<WeatherDisplay />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('85°F')).toBeInTheDocument();
      expect(screen.getByText('clear sky')).toBeInTheDocument();
      expect(screen.getByText('Humidity: 30%')).toBeInTheDocument();
      expect(screen.getByText('Wind: 5.2 mph')).toBeInTheDocument();
      expect(screen.getByTestId('temperature-trend-mock')).toBeInTheDocument();
    });
  });

  it('should render error state when API call fails', async () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    // Act
    render(<WeatherDisplay />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Failed to load weather')).toBeInTheDocument();
      expect(screen.getByText('Please try again later.')).toBeInTheDocument();
    });
  });

  it('should render fallback data with warning when isFallback is true', async () => {
    // Arrange
    const mockFallbackData = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: new Date().toISOString(),
      temperatureTrend: 'stable' as const,
      isFallback: true
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockFallbackData);
    
    // Act
    render(<WeatherDisplay />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('85°F')).toBeInTheDocument();
      expect(screen.getByText('clear sky')).toBeInTheDocument();
      expect(screen.getByText('Using fallback data')).toBeInTheDocument();
      expect(screen.getByTestId('temperature-trend-mock')).toBeInTheDocument();
    });
  });

  it('should conditionally render the TemperatureTrend component when temperatureTrend is provided', async () => {
    // Arrange - With temperature trend
    const mockDataWithTrend = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: new Date().toISOString(),
      temperatureTrend: 'rising' as const
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockDataWithTrend);
    
    // Act - With temperature trend
    render(<WeatherDisplay />);
    
    // Assert - With temperature trend
    await waitFor(() => {
      expect(screen.getByTestId('temperature-trend-mock')).toBeInTheDocument();
    });

    // Cleanup
    jest.clearAllMocks();

    // Arrange - Without temperature trend
    const mockDataWithoutTrend = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: new Date().toISOString()
      // No temperatureTrend property
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockDataWithoutTrend);
    
    // Act - Without temperature trend
    render(<WeatherDisplay />);
    
    // Assert - Without temperature trend
    await waitFor(() => {
      expect(screen.queryByTestId('temperature-trend-mock')).not.toBeInTheDocument();
    });
  });
});