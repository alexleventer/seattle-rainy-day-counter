import React from 'react';
import { render, screen } from '@testing-library/react';
import { LastUpdated } from '../LastUpdated';
import { formatDistanceToNow } from 'date-fns';

// Mock date-fns to control time-based output
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn()
}));

describe('LastUpdated Component', () => {
  const mockDate = new Date('2023-01-01T12:00:00Z');
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the formatDistanceToNow function
    (formatDistanceToNow as jest.Mock).mockReturnValue('5 minutes ago');
  });

  it('should render with the correct timestamp', () => {
    render(<LastUpdated timestamp={mockDate} />);
    
    // Check if the component renders the time element with correct datetime attribute
    const timeElement = screen.getByRole('time');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement).toHaveAttribute('datetime', mockDate.toISOString());
  });

  it('should display the formatted time using date-fns', () => {
    render(<LastUpdated timestamp={mockDate} />);
    
    // Verify formatDistanceToNow was called with correct parameters
    expect(formatDistanceToNow).toHaveBeenCalledWith(mockDate, { addSuffix: true });
    
    // Check if the formatted time is displayed
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
  });

  it('should include the "Last updated:" label', () => {
    render(<LastUpdated timestamp={mockDate} />);
    
    // Check if the label is present
    expect(screen.getByText('Last updated:')).toBeInTheDocument();
  });
});