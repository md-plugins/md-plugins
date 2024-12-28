import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { linkPlugin } from '../src/md-plugin-link'; // Adjust path as needed

describe('linkPlugin', () => {
  it('transforms internal links to use custom tag and attributes', () => {
    const md = new MarkdownIt();
    const pageScripts: Set<string> = new Set();

    // Register the plugin with default options
    md.use(linkPlugin, {
      pageScript:
        'import MarkdownLink from "src/components/md/MarkdownLink.vue"',
    });

    const markdownInput = `[Internal Link](/path/to/page)`;
    const expectedOutput = `
      <MarkdownLink to="/path/to/page">Internal Link</MarkdownLink>
    `.trim();

    const renderedHTML = md.render(markdownInput, { pageScripts });

    expect(renderedHTML).contains(expectedOutput);
    expect(
      pageScripts.has(
        'import MarkdownLink from "src/components/md/MarkdownLink.vue"'
      )
    ).toBe(true);
  });

  it('handles multiple internal links with custom tag', () => {
    const md = new MarkdownIt();
    const pageScripts: Set<string> = new Set();

    // Register the plugin with default options
    md.use(linkPlugin, {
      pageScript:
        'import MarkdownLink from "src/components/md/MarkdownLink.vue"',
    });

    const markdownInput = `
[Link 1](/page-1)
[Link 2](/page-2)
    `.trim();

    const expectedOutput = `
<MarkdownLink to="/page-1">Link 1</MarkdownLink>
<MarkdownLink to="/page-2">Link 2</MarkdownLink>
    `.trim();

    const renderedHTML = md.render(markdownInput, { pageScripts });

    expect(renderedHTML).contains(expectedOutput);
    expect(
      pageScripts.has(
        'import MarkdownLink from "src/components/md/MarkdownLink.vue"'
      )
    ).toBe(true);
  });

  it('uses custom tag and attribute names', () => {
    const md = new MarkdownIt();

    // Register the plugin with custom options
    md.use(linkPlugin, {
      linkTag: 'CustomLink',
      linkToKeyword: 'href',
    });

    const markdownInput = `[Custom Link](/custom-path)`;
    const expectedOutput = `
<CustomLink href="/custom-path">Custom Link</CustomLink>
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).contains(expectedOutput);
  });

  it('does not break if pageScripts is not defined in env', () => {
    const md = new MarkdownIt();

    // Register the plugin with default options
    md.use(linkPlugin, {
      pageScript:
        'import MarkdownLink from "src/components/md/MarkdownLink.vue"',
    });

    const markdownInput = `[No Env Link](/no-env)`;
    const expectedOutput = `
<MarkdownLink to="/no-env">No Env Link</MarkdownLink>
    `.trim();

    const renderedHTML = md.render(markdownInput, {});

    expect(renderedHTML).contains(expectedOutput);
  });
});
