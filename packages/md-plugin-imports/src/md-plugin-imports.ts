import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginSimple } from 'markdown-it'
import type MarkdownIt from 'markdown-it'

const scriptRE = /^\s*<script import>\n([\s\S]*?)\n\s*<\/script>/gm

/**
 * A Markdown-It plugin that extracts and stores script imports from the Markdown content.
 *
 * This plugin replaces script import blocks (delimited by `<script import>` and `</script>`) with an empty string,
 * and adds the extracted script content to the `env.pageScripts` set in the Markdown-It environment.
 *
 * @param md - The Markdown-It instance to extend.
 */
export const importsPlugin: PluginSimple = (md: MarkdownIt): void => {
  const render = md.render.bind(md)

  md.render = (src: string, env: MarkdownItEnv = {}): string => {
    if (!env.pageScripts) {
      env.pageScripts = new Set<string>()
    }

    const mdContent = src.replace(scriptRE, (_, scriptContent) => {
      const imports = scriptContent
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)

      imports.forEach((importLine: string) => {
        env.pageScripts!.add(importLine)
      })

      return '' // Remove script block
    })

    return render(mdContent, env)
  }
}
