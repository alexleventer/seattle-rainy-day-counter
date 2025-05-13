import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the components used in the Home page
jest.mock('@/components/rain-counter', () => ({
  RainCounter: () => <div data-testid="rain-counter">Mocked Rain Counter</div>
}));

jest.mock('@/components/weather-display', () => ({
  WeatherDisplay: () => <div data-testid="weather-display">Mocked Weather Display</div>
}));

describe('Home Page', () => {
  it('should render the Armonk Weather Tracker title', () => {
    // Act
    render(<Home />);
    
    // Assert
    expect(screen.getByText('Armonk Weather Tracker')).toBeInTheDocument();
  });

  it('should render the subtitle with Armonk, NY reference', () => {
    // Act
    render(<Home />);
    
    // Assert
    expect(screen.getByText('Your local weather companion for Armonk, NY')).toBeInTheDocument();
  });

  it('should render the RainCounter component', () => {
    // Act
    render(<Home />);
    
    // Assert
    expect(screen.getByTestId('rain-counter')).toBeInTheDocument();
  });

  it('should render the WeatherDisplay component', () => {
    // Act
    render(<Home />);
    
    // Assert
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
  });

  it('should have the correct layout structure', () => {
    // Act
    render(<Home />);
    
    // Assert
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center');
    
    // Check that the components are in a grid layout
    const gridContainer = screen.getByTestId('rain-counter').parentElement;
    expect(gridContainer).toHaveClass('grid', 'gap-8');
  });
});