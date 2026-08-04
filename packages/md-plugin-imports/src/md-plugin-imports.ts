import type { MarkdownItPlugin } from '@md-plugins/shared'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { MarkdownIt } from 'markdown-it'

const scriptRE = /^\s*<script import>\n([\s\S]*?)\n\s*<\/script>/gm
const fenceStartRE = /^ {0,3}(`{3,}|~{3,})/

type Fence = {
  char: '`' | '~'
  length: number
}

function parseFence(line: string): Fence | undefined {
  const match = fenceStartRE.exec(line)

  if (match === null) {
    return undefined
  }

  const marker = match[1]

  return {
    char: marker[0] as Fence['char'],
    length: marker.length,
  }
}

function isFenceClose(line: string, fence: Fence): boolean {
  const trimmed = line.trim()

  return trimmed.length >= fence.length && trimmed.split('').every((char) => char === fence.char)
}

function extractScriptImports(src: string, env: MarkdownItEnv): string {
  return src.replace(scriptRE, (_, scriptContent) => {
    const imports = scriptContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean)

    imports.forEach((importLine: string) => {
      env.pageScripts!.add(importLine)
    })

    return ''
  })
}

function extractScriptImportsOutsideFences(src: string, env: MarkdownItEnv): string {
  const lines = src.split(/(?<=\n)/)
  let fence: Fence | undefined
  let outsideFenceContent = ''
  let mdContent = ''

  for (const line of lines) {
    const lineWithoutNewline = line.replace(/\n$/, '')

    if (fence !== undefined) {
      mdContent += line

      if (isFenceClose(lineWithoutNewline, fence)) {
        fence = undefined
      }

      continue
    }

    const nextFence = parseFence(lineWithoutNewline)

    if (nextFence !== undefined) {
      mdContent += extractScriptImports(outsideFenceContent, env)
      outsideFenceContent = ''
      mdContent += line
      fence = nextFence
      continue
    }

    outsideFenceContent += line
  }

  return mdContent + extractScriptImports(outsideFenceContent, env)
}

/**
 * A Markdown-It plugin that extracts and stores script imports from the Markdown content.
 *
 * This plugin replaces script import blocks (delimited by `<script import>` and `</script>`) with an empty string,
 * and adds the extracted script content to the `env.pageScripts` set in the Markdown-It environment.
 *
 * @param md - The Markdown-It instance to extend.
 */
export const importsPlugin: MarkdownItPlugin = (md: MarkdownIt): void => {
  const render = md.render.bind(md)

  md.render = (src: string, env: MarkdownItEnv | undefined = {}): string => {
    env.pageScripts = env.pageScripts || new Set<string>()
    const mdContent = extractScriptImportsOutsideFences(src, env)

    return render(mdContent, env)
  }
}
