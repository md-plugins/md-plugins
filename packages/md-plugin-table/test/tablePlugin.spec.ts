import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { tablePlugin } from '../src/md-plugin-table'; // Adjust path as needed

describe('tablePlugin', () => {
  it('adds custom classes to the table, headers, rows, and cells', () => {
    const md = new MarkdownIt();

    // Register the table plugin with custom options
    md.use(tablePlugin, {
      tableClass: 'custom-table-class',
      tableHeaderClass: 'custom-header-class',
      tableRowClass: 'custom-row-class',
      tableCellClass: 'custom-cell-class',
    });

    const markdownInput = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).toContain(
      '<q-markup-table class="custom-table-class">'
    );
    expect(renderedHTML).toContain(
      '<th class="custom-header-class">Header 1</th>'
    );
    expect(renderedHTML).toContain('<tr class="custom-row-class">');
    expect(renderedHTML).toContain('<td class="custom-cell-class">Cell 1</td>');
  });

  it('uses a custom table tag and additional attributes', () => {
    const md = new MarkdownIt();

    // Register the table plugin with custom options
    md.use(tablePlugin, {
      tableToken: 'custom-table-tag',
      tableAttributes: [['data-attr', 'example']],
    });

    const markdownInput = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).toContain(
      '<custom-table-tag class="markdown-page-table" data-attr="example">'
    );
    expect(renderedHTML).toContain('</custom-table-tag>');
  });

  it('renders a table with default classes when no options are provided', () => {
    const md = new MarkdownIt();

    // Register the table plugin with default options
    md.use(tablePlugin);

    const markdownInput = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).toContain(
      '<q-markup-table class="markdown-page-table">'
    );
    expect(renderedHTML).toContain('<th class="text-left">Header 1</th>');
    expect(renderedHTML).toContain('<tr>');
    expect(renderedHTML).toContain('<td>Cell 1</td>');
  });

  it('handles nested tables correctly', () => {
    const md = new MarkdownIt();

    // Register the table plugin
    md.use(tablePlugin);

    const markdownInput = `
| Outer Header 1 | Outer Header 2 |
|----------------|----------------|
| Inner Table:   |                |
|----------------|----------------|
| | Header 1 | Header 2 |        |
| |----------|----------|        |
| | Cell 1   | Cell 2   |        |
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).toContain(
      '<q-markup-table class="markdown-page-table">'
    );
    expect(renderedHTML).toContain(
      '<q-markup-table class="markdown-page-table">'
    );
    expect(renderedHTML).toContain('<td>Inner Table:</td>');
  });

  it('applies additional attributes to the table element', () => {
    const md = new MarkdownIt();

    // Register the table plugin with additional attributes
    md.use(tablePlugin, {
      tableAttributes: [['aria-label', 'Custom Table']],
    });

    const markdownInput = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `.trim();

    const renderedHTML = md.render(markdownInput);

    expect(renderedHTML).toContain(
      '<q-markup-table class="markdown-page-table" aria-label="Custom Table">'
    );
  });
});
