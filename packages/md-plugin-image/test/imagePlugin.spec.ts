import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { imagePlugin } from '../src/md-plugin-image';

describe('imagePlugin', () => {
  it('adds the default class to images', () => {
    const md = new MarkdownIt();
    md.use(imagePlugin);

    const markdownInput = `![alt text](image.jpg)`;
    const renderedHTML = md.render(markdownInput).trim();

    const expectedOutput = `<p><img src="image.jpg" alt="alt text" class="markdown-image"></p>`;
    expect(renderedHTML).toBe(expectedOutput);
  });

  it('adds a custom class to images when provided', () => {
    const md = new MarkdownIt();
    const customClass = 'custom-image-class';
    md.use(imagePlugin, { imageClass: customClass });

    const markdownInput = `![alt text](image.jpg)`;
    const renderedHTML = md.render(markdownInput).trim();

    const expectedOutput = `<p><img src="image.jpg" alt="alt text" class="${customClass}"></p>`;
    expect(renderedHTML).toBe(expectedOutput);
  });

  it('does not affect non-image elements', () => {
    const md = new MarkdownIt();
    md.use(imagePlugin);

    const markdownInput = `# Heading\n\nThis is a paragraph.`;
    const renderedHTML = md.render(markdownInput).trim();

    const expectedOutput = `<h1>Heading</h1>\n<p>This is a paragraph.</p>`;
    expect(renderedHTML).toBe(expectedOutput);
  });

  it('handles multiple images in the same markdown', () => {
    const md = new MarkdownIt();
    md.use(imagePlugin);

    const markdownInput = `![alt1](image1.jpg)\n\n![alt2](image2.jpg)`;
    const renderedHTML = md.render(markdownInput).trim();

    const expectedOutput = `<p><img src="image1.jpg" alt="alt1" class="markdown-image"></p>\n<p><img src="image2.jpg" alt="alt2" class="markdown-image"></p>`;
    expect(renderedHTML).toBe(expectedOutput);
  });

  it('handles images with titles', () => {
    const md = new MarkdownIt();
    md.use(imagePlugin);

    const markdownInput = `![alt text](image.jpg "Image Title")`;
    const renderedHTML = md.render(markdownInput).trim();

    const expectedOutput = `<p><img src="image.jpg" alt="alt text" title="Image Title" class="markdown-image"></p>`;
    expect(renderedHTML).toBe(expectedOutput);
  });
});
