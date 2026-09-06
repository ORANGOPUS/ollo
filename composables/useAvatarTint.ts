// Shared with every mobile (`pages/app/**`) screen: a stable colour + initial
// for any username, so the same person always gets the same tint without a
// dedicated avatar-colour column in `profiles`.
const TINTS = ['#04d87f', '#fdd35c', '#7ec8ff', '#ff9f7a', '#c9a6ff', '#8fe3c4'];

export function initialOf(username?: string | null): string {
  return (username || '?').slice(0, 1).toUpperCase();
}

export function tintFor(username?: string | null): string {
  const key = username || '';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}
