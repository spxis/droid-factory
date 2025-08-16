import { describe, it, expect } from 'vitest';

describe('Environment configuration', () => {
  it('VITE_OMDB_API_KEY must be set', () => {
    const key = process.env.VITE_OMDB_API_KEY;
    expect(key && key.trim().length > 0).toBeTruthy();
  });
});
