import { JwtPayload } from './auth.model';

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Reads the payload of a JWT without verifying its signature. Signature verification is the
 * server's job; the client only needs the claims to show the user and detect expiration.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }
  try {
    const claims = JSON.parse(base64UrlDecode(payload)) as Partial<JwtPayload>;
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') {
      return null;
    }
    return claims as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, now: number = Date.now()): boolean {
  const payload = decodeJwtPayload(token);
  return !payload || payload.exp * 1000 <= now;
}
