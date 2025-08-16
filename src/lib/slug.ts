import slugify from 'slugify';

export function slugifyTitle(title: string): string {
  // Normalize common conjunctions before slugification
  const normalized = title.replace(/&/g, ' and ');

  return slugify(normalized, {
    lower: true,
    strict: true,
    trim: true,
  });
}
