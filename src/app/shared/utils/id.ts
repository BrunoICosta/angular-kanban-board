/**
 * Client-side ids let the UI create entities optimistically (the id is known before the server
 * answers). UUID v4 collisions are not a practical concern.
 */
export function createId(): string {
  return crypto.randomUUID();
}
