import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { containersPlugin } from '../src/md-plugin-containers';
import type {
  Container,
  ContainerDetails,
  ContainerOptions,
} from '../src/types';
import type Token from 'markdown-it/lib/token.mjs';

// Define container types and their default titles
const containers: ContainerDetails[] = [
  { type: 'warning', defaultTitle: 'Warning' },
  { type: 'tip', defaultTitle: 'Tip' },
  { type: 'details', defaultTitle: 'Details' },
];

// Helper to create containers
function createContainer(
  container: Container,
  containerType: string,
  defaultTitle: string
): [Container, string, ContainerOptions] {
  const containerTypeLen = containerType.length;

  return [
    container,
    containerType,
    {
      render(tokens: Token[], idx: number): string {
        const token = tokens[idx];
        const title =
          token.info.trim().slice(containerTypeLen).trim() || defaultTitle;

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${title}</summary>\n`
            : '</details>\n';
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${title}</p>\n`
          : '</div>\n';
      },
    },
  ];
}
describe('containersPlugin', () => {
  it('registers and renders a custom container type', () => {
    const md = new MarkdownIt();

    containersPlugin(md, containers, createContainer);

    const markdownInput = `
::: warning
This is a warning block.
:::

::: tip
This is a tip block.
:::
    `.trim();

    const expectedOutput = `
<div class="markdown-note markdown-note--warning"><p class="markdown-note__title">Warning</p>
<p>This is a warning block.</p>
</div>
<div class="markdown-note markdown-note--tip"><p class="markdown-note__title">Tip</p>
<p>This is a tip block.</p>
</div>
    `.trim();

    const renderedHTML = md.render(markdownInput).trim();

    expect(renderedHTML).toBe(expectedOutput);
  });
  it('renders a container with a custom title', () => {
    const md = new MarkdownIt();

    containersPlugin(md, containers, createContainer);

    const markdownInput = `
::: warning Custom Warning Title
This is a warning block with a custom title.
:::
    `.trim();

    const expectedOutput = `
<div class="markdown-note markdown-note--warning"><p class="markdown-note__title">Custom Warning Title</p>
<p>This is a warning block with a custom title.</p>
</div>
    `.trim();

    const renderedHTML = md.render(markdownInput).trim();

    expect(renderedHTML).toBe(expectedOutput);
  });

  it('handles nested containers correctly', () => {
    const md = new MarkdownIt();

    containersPlugin(md, containers, createContainer);

    const markdownInput = `
::: warning Outer Warning
Outer container content.

::: tip Inner Tip
Inner container content.
::::::
    `.trim();

    const expectedOutput = `
<div class="markdown-note markdown-note--warning"><p class="markdown-note__title">Outer Warning</p>
<p>Outer container content.</p>
<div class="markdown-note markdown-note--tip"><p class="markdown-note__title">Inner Tip</p>
<p>Inner container content.</p>
</div>
</div>
    `.trim();

    const renderedHTML = md.render(markdownInput).trim();

    expect(renderedHTML).toBe(expectedOutput);
  });

  it('renders a details container correctly', () => {
    const md = new MarkdownIt();

    containersPlugin(md, containers, createContainer);

    const markdownInput = `
::: details Summary Title
This is a details block.
:::
    `.trim();

    const expectedOutput = `
<details class="markdown-note markdown-note--details"><summary class="markdown-note__title">Summary Title</summary>
<p>This is a details block.</p>
</details>
    `.trim();

    const renderedHTML = md.render(markdownInput).trim();

    expect(renderedHTML).toBe(expectedOutput);
  });
});
