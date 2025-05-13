import React from 'react';
import { render, screen } from '@testing-library/react';
import { TemperatureTrend } from '../temperature-trend';

describe('TemperatureTrend Component', () => {
  it('should render rising temperature trend correctly', () => {
    // Arrange
    render(<TemperatureTrend trend="rising" />);
    
    // Assert
    expect(screen.getByText('Temperature rising')).toBeInTheDocument();
    const icon = document.querySelector('.text-red-400');
    expect(icon).toBeInTheDocument();
  });

  it('should render falling temperature trend correctly', () => {
    // Arrange
    render(<TemperatureTrend trend="falling" />);
    
    // Assert
    expect(screen.getByText('Temperature falling')).toBeInTheDocument();
    const icon = document.querySelector('.text-blue-400');
    expect(icon).toBeInTheDocument();
  });

  it('should render stable temperature trend correctly', () => {
    // Arrange
    render(<TemperatureTrend trend="stable" />);
    
    // Assert
    expect(screen.getByText('Temperature stable')).toBeInTheDocument();
    const icon = document.querySelector('.text-slate-400');
    expect(icon).toBeInTheDocument();
  });

  it('should default to stable trend for invalid input', () => {
    // Arrange - Testing with type assertion to bypass TypeScript
    // @ts-ignore - Intentionally testing invalid prop
    render(<TemperatureTrend trend="invalid" />);
    
    // Assert
    expect(screen.getByText('Temperature stable')).toBeInTheDocument();
    const icon = document.querySelector('.text-slate-400');
    expect(icon).toBeInTheDocument();
  });

  it('should maintain proper structure with icon and text', () => {
    // Arrange
    render(<TemperatureTrend trend="rising" />);
    
    // Assert
    const container = screen.getByText('Temperature rising').parentElement;
    expect(container).toHaveClass('flex items-center gap-1 text-sm');
    expect(container?.childElementCount).toBe(2); // Icon and text
    expect(container?.firstChild).toHaveClass('h-4 w-4');
    expect(container?.lastChild).toHaveClass('text-slate-400');
  });
});