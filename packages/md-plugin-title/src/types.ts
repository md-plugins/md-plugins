export {}; // make this file a module

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * The title that extracted by `md-plugin-title`
     */
    title?: string;

    heading?: boolean;
  }
}
