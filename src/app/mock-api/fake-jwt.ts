import { JwtPayload, User } from '../core/auth/auth.model';
import { base64UrlEncode } from '../core/auth/jwt';

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

/**
 * Builds a JWT-shaped token. The signature is fake: this only exists so the client handles a
 * realistic token (header.payload.signature) exactly like it would with a real backend.
 */
export function createFakeJwt(user: User, now: number = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat,
    exp: iat + TOKEN_TTL_SECONDS,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(`fake-signature:${user.id}:${iat}`);
  return `${header}.${body}.${signature}`;
}

/** "ana.souza@empresa.com" -> "Ana Souza" */
export function nameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? email;
  return (
    localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || email
  );
}
