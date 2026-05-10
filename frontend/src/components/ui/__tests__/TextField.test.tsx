import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from '../TextField';

describe('TextField', () => {
  it('renders the label and links it to the input', () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('displays an error message and marks aria-invalid', () => {
    render(<TextField label="Email" error="That email is taken" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('That email is taken')).toBeInTheDocument();
  });

  it('shows help text when no error is set', () => {
    render(<TextField label="Email" helpText="We will never share it" />);
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
  });
});
