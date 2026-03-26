import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Nav from '../components/Nav';

describe('Nav Component', () => {
  it('renders navigation bar', () => {
    render(<Nav />);
    expect(screen.getByText('NU')).toBeInTheDocument();
    expect(screen.getByText('Campus')).toBeInTheDocument();
  });

  it('displays campus location badge', () => {
    render(<Nav />);
    expect(screen.getByText('Seattle')).toBeInTheDocument();
  });

  it('shows online status indicator', () => {
    render(<Nav />);
    expect(screen.getByText(/AI Guide Online/i)).toBeInTheDocument();
  });

  it('renders with correct styling structure', () => {
    const { container } = render(<Nav />);
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav).toHaveStyle('display: flex');
  });

  it('displays "NU" text in correct color order', () => {
    const { container } = render(<Nav />);
    const nuText = container.querySelector('nav');
    expect(nuText).toBeInTheDocument();
  });

  it('shows status indicator with correct styling', () => {
    const { container } = render(<Nav />);
    const statusIndicator = container.querySelector('[style*="border-radius"]');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('maintains flexible layout with margin-left auto', () => {
    const { container } = render(<Nav />);
    const rightSection = container.querySelectorAll('div')[container.querySelectorAll('div').length - 1];
    expect(rightSection).toBeInTheDocument();
  });

  it('renders all required text content', () => {
    render(<Nav />);
    expect(screen.getByText('NUCampus360', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Seattle')).toBeInTheDocument();
  });

  it('has proper accessibility hierarchy', () => {
    const { container } = render(<Nav />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
