const vendorRE =
  /node_modules[\\/](vue|@vue|quasar|vue-router)[\\/](.*)\.(m?js|css|sass)$/;
const exampleRE =
  /examples:([a-zA-Z0-9]+)$|src[\\/]examples[\\/]([a-zA-Z0-9-]+)/;

/**
 * A function to determine the manual chunk name for a given module ID.
 *
 * @param id - The module ID to analyze.
 * @returns A string representing the chunk name or `undefined`.
 */
export function viteManualChunks(id: string): string | undefined {
  if (vendorRE.test(id)) {
    return 'vendor';
  }

  const examplesMatch = exampleRE.exec(id);
  if (examplesMatch !== null) {
    const name = examplesMatch[1] || examplesMatch[2];
    return `e.${name}`;
  }

  return undefined;
}
