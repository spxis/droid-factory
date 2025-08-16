// Fetch a character image from Wookieepedia (Star Wars Fandom) via MediaWiki API
// Docs: https://www.mediawiki.org/wiki/API:Page_images
// CORS: add origin=* for browser requests.

const DEFAULT_WOOKIEE_API = 'https://starwars.fandom.com/api.php';

declare const importMetaEnv: { VITE_WOOKIEEPEDIA_API_BASE?: string } | undefined;

function getApiBase(): string {
  // Prefer Vite's import.meta.env if available; fallback to declared shim for types
  const env = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env) || importMetaEnv || {};
  const base = (env as Record<string, string | undefined>).VITE_WOOKIEEPEDIA_API_BASE;
  return (base && base.trim()) || DEFAULT_WOOKIEE_API;
}

type WikiImagePage = {
  original?: { source?: string };
  thumbnail?: { source?: string };
};

type WikiQueryResponse = {
  query?: { pages?: Record<string, WikiImagePage> };
};

async function fetchJson(url: string): Promise<WikiQueryResponse | null> {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) { return null; }
    return (await res.json()) as WikiQueryResponse;
  } catch {
    return null;
  }
}

function pickImageFromPages(pages: Record<string, WikiImagePage> | undefined): string | null {
  if (!pages) { return null; }
  for (const key of Object.keys(pages)) {
    const p = pages[key];
    const original = p?.original?.source as string | undefined;
    const thumb = p?.thumbnail?.source as string | undefined;
    if (original) { return original; }
    if (thumb) { return thumb; }
  }
  return null;
}

export async function fetchWookieeCharacterImageUrl(name: string): Promise<string | null> {
  const api = getApiBase();
  const title = encodeURIComponent(name);

  // 1) Exact title with original image
  const exactOriginal = `${api}?action=query&format=json&origin=*&prop=pageimages&piprop=original&titles=${title}`;
  let data = await fetchJson(exactOriginal);
  let url = pickImageFromPages(data?.query?.pages);
  if (url) { return url; }

  // 2) Exact title with thumbnail fallback
  const exactThumb = `${api}?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=${title}`;
  data = await fetchJson(exactThumb);
  url = pickImageFromPages(data?.query?.pages);
  if (url) { return url; }

  // 3) Search for the page and take first result original
  const searchOriginal = `${api}?action=query&format=json&origin=*&prop=pageimages&piprop=original&generator=search&gsrsearch=${title}`;
  data = await fetchJson(searchOriginal);
  url = pickImageFromPages(data?.query?.pages);
  if (url) { return url; }

  // 4) Search with thumbnail fallback
  const searchThumb = `${api}?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=800&generator=search&gsrsearch=${title}`;
  data = await fetchJson(searchThumb);
  url = pickImageFromPages(data?.query?.pages);
  if (url) { return url; }

  return null;
}
