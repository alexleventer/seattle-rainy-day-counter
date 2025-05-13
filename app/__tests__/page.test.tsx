import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the components used in the Home page
jest.mock('@/components/rain-counter', () => ({
  RainCounter: () => <div data-testid="rain-counter-mock">Rain Counter Mock</div>,
}));

jest.mock('@/components/weather-display', () => ({
  WeatherDisplay: () => <div data-testid="weather-display-mock">Weather Display Mock</div>,
}));

describe('Home Page', () => {
  it('should render the page title correctly', () => {
    render(<Home />);
    
    expect(screen.getByText('Yuma Rain Tracker')).toBeInTheDocument();
  });

  it('should render the RainCounter component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('rain-counter-mock')).toBeInTheDocument();
  });

  it('should render the WeatherDisplay component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('weather-display-mock')).toBeInTheDocument();
  });

  it('should have the correct layout structure', () => {
    render(<Home />);
    
    // Check for main container
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('flex');
    expect(mainElement).toHaveClass('min-h-screen');
    
    // Check for grid layout for components
    const gridContainer = screen.getByText('Yuma Rain Tracker').parentElement?.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('gap-8');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
  });
});