import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders the initials of a multi-word name', () => {
    render(<Avatar name="Felix Q Tester" />);
    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('renders a single initial for one-word names', () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('exposes the name as an aria-label for screen readers', () => {
    render(<Avatar name="Alice Smith" />);
    expect(screen.getByLabelText('Alice Smith')).toBeInTheDocument();
  });

  it('falls back to ? when name is missing', () => {
    render(<Avatar name={null} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
