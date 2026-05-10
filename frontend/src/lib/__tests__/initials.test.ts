import { describe, it, expect } from 'vitest';
import { getInitials, colorForName } from '../initials';

describe('getInitials', () => {
  it('returns first + last initial for multi-word names', () => {
    expect(getInitials('Felix Q Tester')).toBe('FT');
    expect(getInitials('Alice Smith')).toBe('AS');
    expect(getInitials('Mary Jane Watson Smith')).toBe('MS');
  });

  it('returns just the first initial for single-word names', () => {
    expect(getInitials('Madonna')).toBe('M');
    expect(getInitials('felix')).toBe('F');
  });

  it('handles empty / null / whitespace gracefully', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials('   ')).toBe('?');
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });
});

describe('colorForName', () => {
  it('is deterministic for the same name', () => {
    expect(colorForName('Felix Tester')).toBe(colorForName('Felix Tester'));
  });

  it('returns a valid Tailwind background class', () => {
    expect(colorForName('Felix')).toMatch(/^bg-/);
  });

  it('falls back to slate for empty input', () => {
    expect(colorForName(null)).toBe('bg-slate-500');
    expect(colorForName(undefined)).toBe('bg-slate-500');
  });
});
