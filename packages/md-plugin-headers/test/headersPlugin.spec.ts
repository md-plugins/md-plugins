import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { headersPlugin } from '../src/md-plugin-headers'; // Adjust path as needed
import type { HeadersPluginOptions } from '../src/types';
import type { MarkdownItEnv } from '@md-plugins/shared';

describe('headersPlugin', () => {
  it('extracts headers into the Table of Contents (toc)', () => {
    const md = new MarkdownIt();
    const env: MarkdownItEnv = {};

    const options: HeadersPluginOptions = {
      level: [2, 3], // Extract headers at levels 2 and 3
    };

    md.use(headersPlugin, options);

    const markdownInput = `
# Main Heading
Some content.

## Subheading 1
More content.

### Sub-subheading 1.1
Even more content.

## Subheading 2
Last bit of content.
    `.trim();

    md.render(markdownInput, env);

    expect(env.toc).toEqual([
      { id: 'subheading-1', title: 'Subheading 1' },
      { id: 'sub-subheading-1-1', title: 'Sub-subheading 1.1', sub: true },
      { id: 'subheading-2', title: 'Subheading 2' },
    ]);
  });

  it('formats header titles using a custom format function', () => {
    const md = new MarkdownIt();
    const env: MarkdownItEnv = {};

    const options: HeadersPluginOptions = {
      format: (str) => str.toUpperCase(),
    };

    md.use(headersPlugin, options);

    const markdownInput = `
## Subheading 1
Content under Subheading 1.
    `.trim();

    md.render(markdownInput, env);

    expect(env.toc).toEqual([{ id: 'subheading-1', title: 'SUBHEADING 1' }]);
  });

  it('generates custom slugs using a custom slugify function', () => {
    const md = new MarkdownIt();
    const env: MarkdownItEnv = {};

    const options: HeadersPluginOptions = {
      slugify: (str) => `custom-slug-${str.replace(/\s+/g, '-').toLowerCase()}`,
    };

    md.use(headersPlugin, options);

    const markdownInput = `
## Custom Header
Some content.
    `.trim();

    md.render(markdownInput, env);

    expect(env.toc).toEqual([
      { id: 'custom-slug-custom-header', title: 'Custom Header' },
    ]);
  });

  it('respects nested block extraction settings', () => {
    const md = new MarkdownIt();
    const env: MarkdownItEnv = {};

    const options: HeadersPluginOptions = {
      shouldAllowNested: true, // Extract headers inside nested blocks
    };

    md.use(headersPlugin, options);

    const markdownInput = `
# Main Heading
> ## Nested Subheading
> Quoted content.
    `.trim();

    md.render(markdownInput, env);

    expect(env.toc).toEqual([
      { id: 'nested-subheading', title: 'Nested Subheading' },
    ]);
  });

  it('ignores headers outside the specified levels', () => {
    const md = new MarkdownIt();
    const env: MarkdownItEnv = {};

    const options: HeadersPluginOptions = {
      level: [3], // Only extract headers at level 3
    };

    md.use(headersPlugin, options);

    const markdownInput = `
# Main Heading
## Subheading 1
### Sub-subheading 1.1
#### Too deep
    `.trim();

    md.render(markdownInput, env);

    expect(env.toc).toEqual([
      { id: 'sub-subheading-1-1', title: 'Sub-subheading 1.1' },
    ]);
  });
});
