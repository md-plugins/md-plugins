import { resolveTitleFromToken } from '@md-plugins/shared'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginSimple } from 'markdown-it'

/**
 * Extracts the first `h1` title and heading flag into the Markdown environment.
 */
export const titlePlugin: PluginSimple = (md): void => {
  // extract title to env
  const render = md.renderer.render.bind(md.renderer)
  md.renderer.render = (tokens, options, env: MarkdownItEnv): string => {
    const tokenIdx = tokens.findIndex((token) => token.tag === 'h1')
    env.title =
      tokenIdx > -1
        ? resolveTitleFromToken(tokens[tokenIdx + 1]!, {
            shouldAllowHtml: false,
            shouldEscapeText: false,
          })
        : ''
    env.heading = !!env.title
    return render(tokens, options, env)
  }
}
