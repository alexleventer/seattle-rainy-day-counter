import { render, screen, waitFor, act } from '@testing-library/react';
import { RainCounter } from '../rain-counter';
import { getCurrentWeather } from '@/lib/weather';

// Mock the weather library
jest.mock('@/lib/weather');

describe('RainCounter', () => {
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
      })
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading state initially', () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    // Act
    render(<RainCounter />);

    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show "Days Since Last Rain in Armonk" title', () => {
    // Arrange
    (getCurrentWeather as jest.Mock).mockReturnValue(new Promise(() => {}));

    // Act
    render(<RainCounter />);

    // Assert
    expect(screen.getByText('Days Since Last Rain in Armonk')).toBeInTheDocument();
  });

  it('should reset counter to 0 when current weather is rainy', async () => {
    // Arrange
    const rainyWeather = {
      condition: 'Rain',
      description: 'light rain',
      temperature: 55,
      humidity: 80,
      windSpeed: 5,
      timestamp: new Date().toISOString()
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(rainyWeather);
    
    // Set a previous last rain date
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    localStorageMock.setItem('lastRainDate', threeDaysAgo.toISOString());

    // Act
    render(<RainCounter />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('It\'s currently raining!')).toBeInTheDocument();
    });

    // Check that localStorage was updated with current date
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lastRainDate',
      expect.any(String)
    );
  });

  it('should display correct number of days since last rain', async () => {
    // Arrange
    const sunnyWeather = {
      condition: 'Clear',
      description: 'clear sky',
      temperature: 70,
      humidity: 50,
      windSpeed: 3,
      timestamp: new Date().toISOString()
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(sunnyWeather);
    
    // Set last rain date to 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    localStorageMock.setItem('lastRainDate', fiveDaysAgo.toISOString());

    // Act
    render(<RainCounter />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should handle case when there is no stored last rain date', async () => {
    // Arrange
    const sunnyWeather = {
      condition: 'Clear',
      description: 'clear sky',
      temperature: 70,
      humidity: 50,
      windSpeed: 3,
      timestamp: new Date().toISOString()
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(sunnyWeather);
    
    // No last rain date in localStorage

    // Act
    render(<RainCounter />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
      expect(screen.getByText('No rain recorded yet')).toBeInTheDocument();
    });
  });

  it('should update counter periodically', async () => {
    // Arrange
    const sunnyWeather = {
      condition: 'Clear',
      description: 'clear sky',
      temperature: 70,
      humidity: 50,
      windSpeed: 3,
      timestamp: new Date().toISOString()
    };
    (getCurrentWeather as jest.Mock).mockResolvedValue(sunnyWeather);
    
    // Set last rain date to 1 day ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    localStorageMock.setItem('lastRainDate', oneDayAgo.toISOString());

    // Act
    render(<RainCounter />);

    // Assert initial state
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Simulate time passing and component refreshing
    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    // The count should still be 1 as less than a day has passed
    expect(screen.getByText('1')).toBeInTheDocument();

    // Now simulate a full day passing
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    localStorageMock.setItem('lastRainDate', twoDaysAgo.toISOString());

    // Trigger refresh
    act(() => {
      jest.advanceTimersByTime(60000); // Another minute
    });

    // The count should now be 2
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});