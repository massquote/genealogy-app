import { describe, it, expect } from 'vitest';
import { arrayBufferToBase64Url, urlBase64ToUint8Array } from '../push';

describe('VAPID base64 helpers', () => {
  it('round-trips a known VAPID public key', () => {
    const original = 'BBel5WwaYrxz8i-UX-elggUHJqA-HkQEYaH17NQTvzt9I4jm_-SJNEXJK8-1Fx-FNsoBRRnLLBv4ibm_FmbdSIA';
    const bytes = urlBase64ToUint8Array(original);
    expect(bytes.byteLength).toBe(65); // P-256 uncompressed point

    const back = arrayBufferToBase64Url(bytes.buffer);
    expect(back).toBe(original);
  });

  it('handles base64url padding correctly', () => {
    const padded = urlBase64ToUint8Array('YWJj'); // "abc"
    expect(Array.from(padded)).toEqual([97, 98, 99]);
  });

  it('returns empty string for null buffer', () => {
    expect(arrayBufferToBase64Url(null)).toBe('');
  });
});
