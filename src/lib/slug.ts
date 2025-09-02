import slugify from 'slugify';

function slugifyTitle(title: string): string {
  // Normalize common conjunctions before slugification
  const normalized = title.replace(/&/g, ' and ');

  return slugify(normalized, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export { slugifyTitle };
