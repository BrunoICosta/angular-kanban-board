/** "Ana Souza" -> "AS", "marina" -> "MA", "" -> "?" */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic hue (0-359) for a name, so the same person always gets the same color. */
export function hueFromName(name: string | null | undefined): number {
  let hash = 0;
  for (const char of name ?? '') {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
}
