import { render, screen, waitFor, act } from '@testing-library/react';
import { RainCounter } from '../rain-counter';
import { getCurrentWeather } from '@/lib/weather';

// Mock the weather library
jest.mock('@/lib/weather', () => ({
  getCurrentWeather: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RainCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('should show loading state initially', () => {
    render(<RainCounter />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display days since last rain when not currently raining', async () => {
    // Mock localStorage with a past date (5 days ago)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    localStorageMock.getItem.mockReturnValue(fiveDaysAgo.toISOString());

    // Mock current weather as not raining
    (getCurrentWeather as jest.Mock).mockResolvedValue({
      condition: 'Clear',
      description: 'clear sky',
    });

    render(<RainCounter />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Days Since Last Rain in Armonk')).toBeInTheDocument();
  });

  it('should reset counter when it is currently raining', async () => {
    // Mock localStorage with a past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    localStorageMock.getItem.mockReturnValue(pastDate.toISOString());

    // Mock current weather as raining
    (getCurrentWeather as jest.Mock).mockResolvedValue({
      condition: 'Rain',
      description: 'light rain',
    });

    render(<RainCounter />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Counter should be reset to 0
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Should update localStorage with current date
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lastRainDate',
      expect.any(String)
    );
  });

  it('should initialize counter when no previous rain date exists', async () => {
    // Mock localStorage to return null (no previous date)
    localStorageMock.getItem.mockReturnValue(null);

    // Mock current weather as not raining
    (getCurrentWeather as jest.Mock).mockResolvedValue({
      condition: 'Clear',
      description: 'clear sky',
    });

    render(<RainCounter />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should initialize with 0 days
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Should set localStorage with current date
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lastRainDate',
      expect.any(String)
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (getCurrentWeather as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<RainCounter />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Error loading weather data')).toBeInTheDocument();
  });
});