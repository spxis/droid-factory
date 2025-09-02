function normalizeOpeningCrawl(raw?: string | null): string[] {
  if (!raw) {return [];}
  
  const normalized = raw.replace(/\r\n?/g, '\n').trim();
  const blocks = normalized.split(/\n{2,}/);

  return blocks
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean);
}

export { normalizeOpeningCrawl };