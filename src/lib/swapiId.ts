// Decode SWAPI GraphQL Relay-style global IDs like "cGVvcGxlOjIy" -> "people:22"
// Returns the type prefix (e.g., 'people') and the numeric/string id after ':' if possible.
function b64decode(input: string): string {
  // Prefer browser atob; fallback to Buffer for SSR/tests
  if (typeof atob === 'function') {
    return atob(input);
  }
  return Buffer.from(input, 'base64').toString('utf-8');
}

export function decodeGlobalId(globalId: string): { type: string | null; raw: string | null; numericId: number | null } {
  try {
    const decoded = b64decode(globalId);
    const [type, rawId] = decoded.split(':');
    const num = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;

    return { type: type || null, raw: rawId || null, numericId: num };
  } catch {
    return { type: null, raw: null, numericId: null };
  }
}
