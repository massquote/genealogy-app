import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardTitle, CardDescription } from '../Card';

describe('Card', () => {
  it('renders title and description', () => {
    render(
      <Card>
        <CardTitle>My family</CardTitle>
        <CardDescription>3 generations connected</CardDescription>
      </Card>,
    );
    expect(screen.getByText('My family')).toBeInTheDocument();
    expect(screen.getByText('3 generations connected')).toBeInTheDocument();
  });

  it('respects the padding prop', () => {
    const { container } = render(<Card padding="lg">x</Card>);
    expect(container.firstChild).toHaveClass('p-7');
  });
});
