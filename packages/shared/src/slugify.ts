// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;
const andRE = /&/g;

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Lowercase
    .toLowerCase()
    // Replace & with '-and-'
    .replace(andRE, '-and-')
    // Remove accents
    .replace(rCombining, '')
    // Replace control characters with '-'
    .replace(rControl, '-')
    // Replace special characters with '-'
    .replace(rSpecial, '-')
    // Remove non-word characters (after handling spaces and special chars)
    .replace(/[^a-z0-9-]+/g, '')
    // Remove multi-separators
    .replace(/-{2,}/g, '-')
    // Remove prefixing and trailing separators
    .replace(/^-+|-+$/g, '')
    // Ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1');
