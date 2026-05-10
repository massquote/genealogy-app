import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonForm } from '../PersonForm';

describe('PersonForm', () => {
  it('shows validation errors when required fields are blank', async () => {
    const onSubmit = vi.fn();
    render(<PersonForm onSubmit={onSubmit} submitLabel="Add" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect((await screen.findAllByText('Required')).length).toBeGreaterThanOrEqual(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the values when the form is valid', async () => {
    const onSubmit = vi.fn();
    render(<PersonForm onSubmit={onSubmit} submitLabel="Add" />);

    await userEvent.type(screen.getByLabelText('First name'), 'Mary');
    await userEvent.type(screen.getByLabelText('Last name'), 'Smith');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.first_name).toBe('Mary');
    expect(submitted.last_name).toBe('Smith');
  });

  it('honours defaultValues for editing', () => {
    render(
      <PersonForm
        onSubmit={vi.fn()}
        defaultValues={{ first_name: 'Already', last_name: 'There' }}
      />,
    );
    expect(screen.getByLabelText('First name')).toHaveValue('Already');
    expect(screen.getByLabelText('Last name')).toHaveValue('There');
  });
});
