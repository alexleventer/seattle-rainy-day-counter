import React from 'react';
import { render } from '@testing-library/react';
import RootLayout from '../../app/layout';

describe('RootLayout Component', () => {
  it('should render children correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Child Content</div>
      </RootLayout>
    );
    
    // Check if the html element has the correct lang attribute
    const htmlElement = container.querySelector('html');
    expect(htmlElement).toHaveAttribute('lang', 'en');
    
    // Check if children are rendered
    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
  });

  it('should have the correct metadata', () => {
    // This is a bit tricky to test directly since metadata is handled by Next.js
    // We can test the exported metadata object instead
    const { metadata } = require('../../app/layout');
    
    expect(metadata).toEqual({
      title: 'v0 App',
      description: 'Created with v0',
      generator: 'v0.dev'
    });
  });

  it('should have a valid structure with html and body tags', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    // Check for basic structure
    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
  });
});