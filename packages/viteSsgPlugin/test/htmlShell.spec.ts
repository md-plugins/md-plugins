import { describe, expect, it } from 'vitest'
import { replaceSsgMountElement } from '../src/htmlShell'

describe('SSG HTML shell helpers', () => {
  it.each([
    {
      name: 'double-quoted id',
      shell: '<div id="q-app"></div>',
      expected: '<div id="q-app"><main>Rendered</main></div>',
    },
    {
      name: 'single-quoted id',
      shell: "<div id='q-app'></div>",
      expected: "<div id='q-app'><main>Rendered</main></div>",
    },
    {
      name: 'unquoted production id',
      shell: '<div id=q-app></div>',
      expected: '<div id=q-app><main>Rendered</main></div>',
    },
    {
      name: 'reordered attributes',
      shell: '<main class="app" data-before id = "q-app" aria-live="polite"></main>',
      expected:
        '<main class="app" data-before id = "q-app" aria-live="polite"><main>Rendered</main></main>',
    },
    {
      name: 'custom element',
      shell: '<q-app-shell data-app id="q-app"></q-app-shell>',
      expected: '<q-app-shell data-app id="q-app"><main>Rendered</main></q-app-shell>',
    },
  ])('replaces an empty mount element with a $name', ({ shell, expected }) => {
    expect(replaceSsgMountElement(shell, '<main>Rendered</main>', 'q-app')).toBe(expected)
  })

  it('escapes custom mount IDs and inserts replacement tokens literally', () => {
    const renderedAppHtml = `<main>$&|$1|$2|$\`|$'|$$</main>`

    expect(
      replaceSsgMountElement(
        '<app-root id="app.root[0]"></app-root>',
        renderedAppHtml,
        'app.root[0]',
      ),
    ).toBe(`<app-root id="app.root[0]">${renderedAppHtml}</app-root>`)
  })

  it.each([
    '<div data-id="q-app"></div>',
    '<div id="q-app-secondary"></div>',
    '<div id=q-app-secondary></div>',
    '<div id="q-app">Existing content</div>',
  ])('does not match an invalid mount candidate: %s', (shell) => {
    expect(() => replaceSsgMountElement(shell, '<main>Rendered</main>', 'q-app')).toThrow(
      'Could not find empty app mount element',
    )
  })
})
