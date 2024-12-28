export {}; // make this file a module

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * An array of page script (import statements) to be included.
     */
    pageScripts?: Set<string>;
  }
}
