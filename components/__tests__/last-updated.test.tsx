import React from 'react';
import { render, screen } from '@testing-library/react';
import { LastUpdated } from '../last-updated';
import { formatDistanceToNow } from 'date-fns';

// Mock date-fns to control time-based output
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn()
}));

describe('last-updated Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the formatDistanceToNow function
    (formatDistanceToNow as jest.Mock).mockReturnValue('10 minutes ago');
  });

  it('should render correctly with Date object input', () => {
    const mockDate = new Date('2023-01-01T12:00:00Z');
    render(<LastUpdated timestamp={mockDate} />);
    
    // Verify formatDistanceToNow was called with the correct date
    expect(formatDistanceToNow).toHaveBeenCalledWith(mockDate, { addSuffix: true });
    
    // Check if the formatted time is displayed with the label
    expect(screen.getByText('Last updated 10 minutes ago')).toBeInTheDocument();
  });

  it('should render correctly with string timestamp input', () => {
    const dateString = '2023-01-01T12:00:00Z';
    render(<LastUpdated timestamp={dateString} />);
    
    // Verify the string was converted to a Date object
    const expectedDate = new Date(dateString);
    expect(formatDistanceToNow).toHaveBeenCalledWith(expect.any(Date), { addSuffix: true });
    
    // Check if the formatted time is displayed
    expect(screen.getByText('Last updated 10 minutes ago')).toBeInTheDocument();
  });

  it('should apply the correct CSS classes', () => {
    render(<LastUpdated timestamp={new Date()} />);
    
    // Check if the component has the correct styling classes
    const container = screen.getByText(/Last updated/).parentElement;
    expect(container).toHaveClass('text-sm');
    expect(container).toHaveClass('text-slate-400');
  });
});