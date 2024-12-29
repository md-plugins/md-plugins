import type { Plugin } from 'vite';
import { join } from 'node:path';
// import { fileURLToPath } from 'node:url';
import { globSync } from 'tinyglobby';

const moduleIdRE = /^examples:/;
const resolvedIdPrefix = '\0examples:';

// const targetFolder = fileURLToPath(new URL('../src/examples', import.meta.url));
let targetFolder = '';

/**
 * Generates import statements for Vue example files in development mode.
 *
 * This function processes the given ID to create import statements using
 * Vite's `import.meta.glob` for both the Vue components and their raw content.
 *
 * @param id - The resolved ID string, expected to start with the resolvedIdPrefix.
 * @returns A string containing export statements for the example files using
 *          `import.meta.glob`, or undefined if the ID doesn't start with
 *          the resolvedIdPrefix.
 */
function devLoad(id: string): string | undefined {
  if (id.startsWith(resolvedIdPrefix)) {
    const query = `'/src/examples/${id.substring(id.indexOf(':') + 1)}/*.vue'`;
    return (
      `export const code = import.meta.glob(${query}, { eager: true })` +
      `\nexport const source = import.meta.glob(${query}, { query: '?raw', import: 'default', eager: true })`
    );
  }
  return undefined;
}

/**
 * Generates import and export statements for Vue example files in production mode.
 *
 * This function processes the given ID to extract example files, creates import
 * statements for both the Vue components and their raw content, and generates
 * an export statement for all the imported items.
 *
 * @param id - The resolved ID string starting with the resolvedIdPrefix.
 * @returns A string containing import and export statements for the example files,
 *          or undefined if the ID doesn't start with the resolvedIdPrefix.
 */
function prodLoad(id: string): string | undefined {
  if (id.startsWith(resolvedIdPrefix)) {
    const exampleId = id.substring(id.indexOf(':') + 1);
    const files = globSync('*.vue', { cwd: join(targetFolder, exampleId) });

    const importList = files.map((entry) =>
      entry.substring(0, entry.length - 4)
    );
    const importStatements = importList
      .map(
        (entry) =>
          `import ${entry} from 'app/src/examples/${exampleId}/${entry}.vue'` +
          `\nimport Raw${entry} from 'app/src/examples/${exampleId}/${entry}.vue?raw'`
      )
      .join('\n');

    const exportStatements = importList
      .map((entry) => `${entry},Raw${entry}`)
      .join(',');

    return importStatements + `\nexport {${exportStatements}}`;
  }
  return undefined;
}

/**
 * Creates a Vite plugin for handling Markdown examples.
 *
 * This plugin is designed to work with the `viteExamplesPlugin` function, which sets the `targetFolder`
 * path. The plugin resolves module IDs starting with "examples:" and loads example code based on the
 * production or development environment.
 *
 * @param isProd - A boolean indicating whether the Vite build is in production mode.
 * @returns A Vite plugin object.
 */
function vitePlugin(isProd: boolean): Plugin {
  if (!targetFolder) {
    throw new Error('targetFolder is not defined');
  }

  return {
    name: 'markdown-examples',
    enforce: 'pre', // before vue

    resolveId(id: string): string | undefined {
      if (moduleIdRE.test(id)) {
        return '\0' + id;
      }
      return undefined;
    },

    load: isProd ? prodLoad : devLoad,
  };
}

/**
 * Creates a Vite plugin for handling Markdown examples.
 *
 * This function sets up the target folder for example files and returns a function
 * that creates the actual Vite plugin. The returned plugin resolves and loads
 * example code based on the production or development environment.
 *
 * @param path - The path to the directory containing the example files.
 *               This path will be used as the target folder for resolving examples.
 *
 * @returns A function that creates a Vite plugin.
 */
export function viteExamplesPlugin(path: string): (isProd: boolean) => Plugin {
  targetFolder = path;

  return vitePlugin;
}
