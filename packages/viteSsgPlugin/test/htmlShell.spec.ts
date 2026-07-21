import { describe, expect, it } from 'vitest'
import { injectSsgTeleports, replaceSsgMountElement } from '../src/htmlShell'

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

  it('injects multiple Vue SSR Teleports into dedicated targets', () => {
    const modalHtml = '<!--teleport start anchor--><div>Modal $& $1</div><!--teleport anchor-->'
    const alertHtml = '<!--teleport start anchor--><strong>Alert</strong><!--teleport anchor-->'

    expect(
      injectSsgTeleports(
        '<html><body><div id="q-app"></div><div id=modals></div><aside id="alerts"></aside></body></html>',
        {
          '#modals': modalHtml,
          '#alerts': alertHtml,
        },
      ),
    ).toBe(
      `<html><body><div id="q-app"></div><div id=modals>${modalHtml}</div><aside id="alerts">${alertHtml}</aside></body></html>`,
    )
  })

  it('returns the shell unchanged when Vue produced no Teleports', () => {
    const shell = '<html><body><div id="q-app"></div></body></html>'

    expect(injectSsgTeleports(shell, undefined)).toBe(shell)
    expect(injectSsgTeleports(shell, {})).toBe(shell)
  })

  it.each(['body', '.modals', '#modals .content', '#app.modal', '#'])(
    'rejects an unsupported Vue SSR Teleport target: %s',
    (target) => {
      expect(() => injectSsgTeleports('<div id="modals"></div>', { [target]: 'Modal' })).toThrow(
        'Use a simple #id selector',
      )
    },
  )

  it.each([
    {
      name: 'missing',
      shell: '<div id="other"></div>',
    },
    {
      name: 'non-empty',
      shell: '<div id="modals">Existing content</div>',
    },
  ])('rejects a $name Vue SSR Teleport target', ({ shell }) => {
    expect(() => injectSsgTeleports(shell, { '#modals': '<div>Modal</div>' })).toThrow(
      'Could not find an empty Vue SSR Teleport target for "#modals"',
    )
  })

  it('rejects malformed Vue SSR Teleport context data', () => {
    expect(() =>
      injectSsgTeleports('<div id="modals"></div>', [] as unknown as Record<string, string>),
    ).toThrow('teleports must be a record')
    expect(() =>
      injectSsgTeleports('<div id="modals"></div>', {
        '#modals': 42,
      } as unknown as Record<string, string>),
    ).toThrow('content for target "#modals" must be a string')
  })
})
