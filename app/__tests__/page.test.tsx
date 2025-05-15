import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the imported components
jest.mock('@/components/rain-counter', () => ({
  RainCounter: () => <div data-testid="mock-rain-counter">Rain Counter Mock</div>
}));

jest.mock('@/components/weather-display', () => ({
  WeatherDisplay: () => <div data-testid="mock-weather-display">Weather Display Mock</div>
}));

jest.mock('@/components/last-updated', () => ({
  LastUpdated: ({ timestamp }: { timestamp: Date }) => (
    <div data-testid="mock-last-updated">Last Updated Mock: {timestamp.toISOString()}</div>
  )
}));

jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="mock-alert-circle">Alert Circle Mock</div>
}));

describe('Home Page Component', () => {
  it('should render the main heading', () => {
    render(<Home />);
    expect(screen.getByText('Seattle Rain Tracker')).toBeInTheDocument();
  });

  it('should render the RainCounter component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-rain-counter')).toBeInTheDocument();
  });

  it('should render the WeatherDisplay component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-weather-display')).toBeInTheDocument();
  });

  it('should render the LastUpdated component with a date', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-last-updated')).toBeInTheDocument();
  });

  it('should render the rainfall data section', () => {
    render(<Home />);
    expect(screen.getByText('Current Rainfall Data')).toBeInTheDocument();
    expect(screen.getByText("Today's rainfall: 0.5 inches")).toBeInTheDocument();
    expect(screen.getByText('Weekly total: 2.3 inches')).toBeInTheDocument();
  });

  it('should render the footer with attribution', () => {
    render(<Home />);
    expect(screen.getByText(/Data updates hourly/)).toBeInTheDocument();
    expect(screen.getByText(/Weather data provided by OpenWeatherMap/)).toBeInTheDocument();
  });

  it('should render the alert section with tips', () => {
    render(<Home />);
    expect(screen.getByText('Rain Tips:')).toBeInTheDocument();
    expect(screen.getByText('Carry an umbrella')).toBeInTheDocument();
    expect(screen.getByText('Wear waterproof shoes')).toBeInTheDocument();
    expect(screen.getByText('Check forecast before going out')).toBeInTheDocument();
  });
});