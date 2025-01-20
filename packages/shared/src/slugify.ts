const andRE = /&/g
const rCombining = /[\u0300-\u036F]/g
// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .trim() // Trim leading and trailing whitespace
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert hyphen between camelCase or PascalCase
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .toLowerCase() // Convert to lowercase
    .normalize('NFKD') // Normalize to NFKD form
    .replace(rCombining, '') // Remove accents
    .replace(andRE, '-and-') // Replace & with '-and-'
    .replace(rControl, '-') // Replace control characters with '-'
    .replace(rSpecial, '-') // Replace special characters with '-'
    .replace(/[^a-z0-9-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/([a-z])(\d)/g, '$1-$2') // Add a hyphen between a letter and a number
    .replace(/(\d)([a-z])/g, '$1-$2') // Add a hyphen between a number and a letter
    .replace(/-{2,}/g, '-') // Remove multiple hyphens
    .replace(/(^-|-$)/g, '') // Remove leading and trailing hyphens
    .replace(/^(\d)/, '_$1') // Ensure it doesn't start with a number
