import { render, screen } from '@testing-library/react';
import { DataFreshness } from '../data-freshness';
import { formatDistanceToNow } from 'date-fns';

// Mock date-fns to control the output
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn()
}));

describe('DataFreshness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the timestamp with correct formatting', () => {
    // Setup mock return value
    (formatDistanceToNow as jest.Mock).mockReturnValue('5 minutes ago');
    
    const timestamp = '2023-06-15T10:30:00Z';
    render(<DataFreshness timestamp={timestamp} />);
    
    // Check if the component renders correctly
    expect(screen.getByText('Data last updated:')).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    
    // Check if the time element has the correct datetime attribute
    const timeElement = screen.getByRole('time');
    expect(timeElement).toHaveAttribute('datetime', timestamp);
    
    // Verify formatDistanceToNow was called with correct parameters
    expect(formatDistanceToNow).toHaveBeenCalledWith(
      new Date(timestamp),
      { addSuffix: true }
    );
  });

  it('should handle different timestamp formats', () => {
    (formatDistanceToNow as jest.Mock).mockReturnValue('1 hour ago');
    
    const timestamp = '2023-06-15T09:30:00.000Z';
    render(<DataFreshness timestamp={timestamp} />);
    
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(formatDistanceToNow).toHaveBeenCalledWith(
      new Date(timestamp),
      { addSuffix: true }
    );
  });

  it('should handle current timestamp', () => {
    (formatDistanceToNow as jest.Mock).mockReturnValue('less than a minute ago');
    
    const now = new Date().toISOString();
    render(<DataFreshness timestamp={now} />);
    
    expect(screen.getByText('less than a minute ago')).toBeInTheDocument();
    expect(formatDistanceToNow).toHaveBeenCalledWith(
      expect.any(Date),
      { addSuffix: true }
    );
  });
});