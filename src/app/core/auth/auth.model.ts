export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  /** Issued at (seconds since epoch). */
  iat: number;
  /** Expiration (seconds since epoch). */
  exp: number;
}
