import { describe, expect, it } from 'vitest';
import { formatSeconds } from './dashboardUtils';

describe('response time formatting', () => {
  it('distinguishes missing measurements from immediate replies', () => {
    expect(formatSeconds(null)).toBe('—');
    expect(formatSeconds(0)).toBe('0s');
    expect(formatSeconds(8)).toBe('8s');
  });

  it('rounds before splitting minutes and seconds', () => {
    expect(formatSeconds(59.9)).toBe('1min 0s');
    expect(formatSeconds(119.9)).toBe('2min 0s');
  });
});
