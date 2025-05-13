import { render, screen, waitFor, act } from '@testing-library/react';
import { RainCounter } from '../rain-counter';

// Mock the fetch function
global.fetch = jest.fn();

describe('RainCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should display loading state initially', () => {
    // Mock fetch to never resolve
    (fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<RainCounter />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display days since last rain when not currently raining', async () => {
    // Mock localStorage to return a past date
    const lastRainDate = new Date();
    lastRainDate.setDate(lastRainDate.getDate() - 5); // 5 days ago
    (window.localStorage.getItem as jest.Mock).mockReturnValue(lastRainDate.toISOString());
    
    // Mock fetch to return non-rainy weather
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        condition: 'Clear',
        description: 'clear sky'
      })
    });
    
    render(<RainCounter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Days Since Last Rain in Yuma')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 5 days counter
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('should reset counter when it is currently raining', async () => {
    // Mock fetch to return rainy weather
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        condition: 'Rain',
        description: 'light rain'
      })
    });
    
    render(<RainCounter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Should show 0 days since it's currently raining
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('IT\'S RAINING NOW!')).toBeInTheDocument();
    
    // Should have updated localStorage with current date
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'lastRainDate',
      expect.any(String)
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return an error
    (fetch as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(<RainCounter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('should update counter every minute', async () => {
    // Mock localStorage to return a date just under a day ago
    const lastRainDate = new Date();
    lastRainDate.setHours(lastRainDate.getHours() - 23);
    (window.localStorage.getItem as jest.Mock).mockReturnValue(lastRainDate.toISOString());
    
    // Mock fetch to return non-rainy weather
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        condition: 'Clear',
        description: 'clear sky'
      })
    });
    
    render(<RainCounter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initially should show 0 days (less than 24 hours)
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Advance time by 2 hours to cross the 24-hour threshold
    act(() => {
      jest.advanceTimersByTime(2 * 60 * 60 * 1000);
    });
    
    // Now it should show 1 day
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('day')).toBeInTheDocument(); // Singular form
  });
});