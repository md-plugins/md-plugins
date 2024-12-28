import type { MenuItem } from './types';
import { mdParse } from './md-parse';

// Regex to match markdown files
const mdRE = /\.md$/;

let globalMenu: MenuItem[] = [];
let globalPrefix: string = '';

/**
 * Transforms markdown content into Vue Single File Component (SFC) format.
 *
 * @param code - The markdown content to be transformed.
 * @param id - The identifier (typically the file path) of the markdown file.
 * @returns The transformed Vue SFC content, or null if the file is not a markdown file.
 * @throws Will throw an error if the markdown transformation process fails.
 */
function transform(code: string, id: string) {
  // Skip files that are not markdown
  if (!mdRE.test(id)) return null;
  // console.log('transform', code, id)

  try {
    // Transform markdown to Vue SFC
    return mdParse(code, id, globalPrefix, globalMenu);
  } catch (err) {
    console.error(`Error processing Markdown file: ${id}`, err);
    throw new Error(
      `Markdown transform failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * A Vite plugin object that transforms Markdown content into Vue Single File Components (SFCs).
 * This plugin is configured with a path prefix and a navigation menu structure.
 */
const mdPlugins = {
  name: 'md-plugins:vitePlugin',
  enforce: 'pre', // before vue

  transform,
};

/**
 * Creates a Vite plugin for processing Markdown files.
 * This plugin transforms Markdown content into Vue Single File Components (SFCs).
 *
 * @param path - The base path prefix to be used for routing or file resolution.
 * @param menu - An array of MenuItem objects representing the navigation menu structure.
 * @returns A Vite plugin object with pre-configured settings for Markdown processing.
 */
export function viteMdPlugin(path: string, menu: MenuItem[]) {
  globalMenu = menu;
  globalPrefix = path;

  return mdPlugins;
}
