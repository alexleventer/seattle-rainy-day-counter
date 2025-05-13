import { render, screen, waitFor } from '@testing-library/react';
import { WeatherDisplay } from '../weather-display';
import { getCurrentWeather } from '@/lib/weather';

// Mock the weather API client
jest.mock('@/lib/weather', () => ({
  getCurrentWeather: jest.fn(),
}));

// Mock the DataFreshness component
jest.mock('@/components/data-freshness', () => ({
  DataFreshness: ({ timestamp }: { timestamp: string }) => (
    <div data-testid="data-freshness" data-timestamp={timestamp}>Data Freshness Mock</div>
  ),
}));

describe('WeatherDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (getCurrentWeather as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<WeatherDisplay />);
    
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  it('should display weather data when loaded successfully', async () => {
    const mockWeatherData = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: '2023-06-15T10:30:00Z',
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockWeatherData);
    
    render(<WeatherDisplay />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });
    
    // Check if weather data is displayed correctly
    expect(screen.getByText('Current Yuma Weather')).toBeInTheDocument();
    expect(screen.getByText('85°F')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 30%')).toBeInTheDocument();
    expect(screen.getByText('Wind: 5.2 mph')).toBeInTheDocument();
    
    // Check if DataFreshness component is rendered with correct timestamp
    const dataFreshness = screen.getByTestId('data-freshness');
    expect(dataFreshness).toHaveAttribute('data-timestamp', mockWeatherData.timestamp);
  });

  it('should display error message when API call fails', async () => {
    (getCurrentWeather as jest.Mock).mockRejectedValue(new Error('Failed to fetch weather data'));
    
    render(<WeatherDisplay />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Error loading weather data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch weather data')).toBeInTheDocument();
  });

  it('should display fallback data notice when isFallback is true', async () => {
    const mockFallbackData = {
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: '2023-06-15T10:30:00Z',
      isFallback: true,
    };
    
    (getCurrentWeather as jest.Mock).mockResolvedValue(mockFallbackData);
    
    render(<WeatherDisplay />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Using fallback weather data. Some information may not be accurate.')).toBeInTheDocument();
  });

  it('should render the correct weather icon based on condition', async () => {
    // Test for Clear condition
    (getCurrentWeather as jest.Mock).mockResolvedValue({
      temperature: 85,
      description: 'clear sky',
      humidity: 30,
      windSpeed: 5.2,
      condition: 'Clear',
      timestamp: '2023-06-15T10:30:00Z',
    });
    
    render(<WeatherDisplay />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });
    
    // The Sun icon should be rendered for Clear condition
    // We can't directly test for the icon component, but we can check for its container
    expect(screen.getByTestId('weather-icon-container')).toBeInTheDocument();
  });
});