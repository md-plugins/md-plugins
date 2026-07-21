import { describe, expect, it } from 'vitest'
import { replaceQPressMountElement } from '../src/ssg/replace-mount-element'

describe('Q-Press SSG renderer', () => {
  it('inserts rendered replacement tokens literally', () => {
    const renderedAppHtml = `<main>$&|$1|$2|$\`|$'|$$</main>`
    const html = replaceQPressMountElement(
      '<html><body><div class="app" id=q-app></div><footer>Footer</footer></body></html>',
      renderedAppHtml,
      'q-app',
    )

    expect(html).toBe(
      `<html><body><div class="app" id=q-app>${renderedAppHtml}</div><footer>Footer</footer></body></html>`,
    )
  })
})
