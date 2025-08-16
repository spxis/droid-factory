export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
  .replace(/[\u2019'".,!?():]/g, '') // remove punctuation including curly apostrophe
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
