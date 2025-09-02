// Extracts a 4-digit year from an ISO-like date string (e.g., '1977-05-25').
// Returns undefined when input is falsy or not long enough.
function extractYear(dateStr?: string | null): string | undefined {
  if (!dateStr || dateStr.length < 4) { return undefined; }
  return dateStr.slice(0, 4);
}

export { extractYear };
