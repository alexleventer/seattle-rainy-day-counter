import { render, screen } from '@testing-library/react';
import { TemperatureTrend } from '../temperature-trend';

describe('TemperatureTrend', () => {
  it('should render rising temperature trend correctly', () => {
    render(<TemperatureTrend trend="rising" />);
    
    expect(screen.getByText('Temperature rising')).toBeInTheDocument();
    const icon = screen.getByText('Temperature rising').previousSibling;
    expect(icon).toHaveClass('text-red-400');
  });

  it('should render falling temperature trend correctly', () => {
    render(<TemperatureTrend trend="falling" />);
    
    expect(screen.getByText('Temperature falling')).toBeInTheDocument();
    const icon = screen.getByText('Temperature falling').previousSibling;
    expect(icon).toHaveClass('text-blue-400');
  });

  it('should render stable temperature trend correctly', () => {
    render(<TemperatureTrend trend="stable" />);
    
    expect(screen.getByText('Temperature stable')).toBeInTheDocument();
    const icon = screen.getByText('Temperature stable').previousSibling;
    expect(icon).toHaveClass('text-slate-400');
  });

  it('should handle unexpected trend values by defaulting to stable', () => {
    // @ts-ignore - Testing invalid prop value
    render(<TemperatureTrend trend="unknown" />);
    
    expect(screen.getByText('Temperature stable')).toBeInTheDocument();
    const icon = screen.getByText('Temperature stable').previousSibling;
    expect(icon).toHaveClass('text-slate-400');
  });
});