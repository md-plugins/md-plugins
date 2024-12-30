import type { PluginWithOptions } from 'markdown-it'
import type { Options } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { CodeblockPluginOptions } from './types'

import type MarkdownIt from 'markdown-it'
import prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'

// Default language definitions (can be overridden by user)
const defaultLangList = [
  { name: 'markup' },
  { name: 'bash', customCopy: true },
  { name: 'javascript', aliases: 'javascript|js' },
  { name: 'typescript', aliases: 'typescript|ts' },
  { name: 'sass' },
  { name: 'scss' },
  { name: 'css' },
  { name: 'json' },
  { name: 'xml' },
  { name: 'nginx' },
  { name: 'html' },

  // special grammars:
  { name: 'diff' },
]

export const codeblocksPlugin: PluginWithOptions<CodeblockPluginOptions> = (
  md: MarkdownIt,
  {
    defaultLang = 'markup',
    containerComponent = 'MarkdownPrerender',
    copyButtonComponent = 'MarkdownCopyButton',
    preClass = 'markdown-code',
    codeClass = '',
    linePrefixClass = 'line-',
    tabPanelTagName = 'q-tab-panel',
    tabPanelTagClass = 'q-pa-none',
    pageScripts = [
      "import MarkdownPrerender from 'src/components/md/MarkdownPrerender'", // ts file
      "import MarkdownCopyButton from 'src/components/md/MarkdownCopyButton.vue'",
    ],
    langList = defaultLangList,
  }: CodeblockPluginOptions = {},
): void => {
  const customCopyLangList = langList.filter((l) => l.customCopy).map((l) => l.name)

  loadLanguages(langList.map((l) => l.name))

  const langMatch = langList.map((l) => l.aliases || l.name).join('|')

  /**
   * lang -> one of the supported languages (langList)
   * attrs -> optional attributes:
   *    * numbered - lines are numbered
   *    * highlight=1,2-4,6 - lines are highlighted
   *    * add=1,2-4,6 - lines are added
   *    * rem=1,2-4,6 - lines are removed
   *    * maxheight=300px - max height of the code block (including CSS unit)
   * title -> optional card title
   */
  const definitionLineRE = new RegExp(
    '^' +
      `(?<lang>(tabs|${langMatch}))` + // language name
      '(\\s+\\[(?<attrs>[^\\]]+)\\])?' + // optional attrs
      '(\\s+(?<title>.+))?' + // optional title
      '$',
  )

  /**
   * <<| lang [attrs] [title] |>>
   * ...content...
   */
  const tabsLineRE = new RegExp(
    '^' +
      '<<\\|\\s*' + // starts with "<<|" + optional spaces
      `(?<lang>${langMatch})` + // language
      '(?:\\s+\\[(?<attrs>[^\\]]+)\\])?' + // optional attrs (non-capturing group for optional attributes in square brackets)
      '(?:\\s+(?<title>.+?))?' + // optional title (non-capturing group for the title)
      '\\s*\\|>>$', // ends with "|>>" + optional spaces
  )

  const magicCommentList = ['highlight', 'rem', 'add']
  const magicCommentRE = new RegExp(` *\\[\\[! (?<type>(${magicCommentList.join('|')}))\\]\\] *`)
  const magicCommentGlobalRE = new RegExp(magicCommentRE, 'g')

  function parseAttrs(rawAttrs: string | null): { [x: string]: any } {
    if (rawAttrs === null) return {}

    const acc: { [x: string]: any } = {}
    const attrList = rawAttrs.split(/\s+/)

    for (const attr of attrList) {
      const [key, value] = attr.split('=')
      if (key !== undefined) {
        // Normalize the value: remove quotes and trim whitespace
        const normalizedValue =
          value !== undefined
            ? value.trim().replace(/^['"]|['"]$/g, '') // Remove quotes
            : true // If no value, set as boolean true
        acc[key.trim()] = normalizedValue
      }
    }
    return acc
  }

  function extractTabs(content: string): { param: string; content: string } | undefined {
    const list: string[] = []
    const tabMap: { [x: string]: { attrs: any; content: string[] } } = {}

    let currentTabName: string | null = null

    for (const line of content.split('\n').map((line) => line.trim())) {
      if (line.startsWith('<<|')) {
        const tabsMatch: RegExpMatchArray | null = line.match(tabsLineRE)

        if (tabsMatch !== null) {
          const { groups } = tabsMatch

          const lang = groups?.lang
          const attrs = groups?.attrs
          const title = groups?.title

          currentTabName = title?.trim() || `Tab ${list.length + 1}`

          if (currentTabName) {
            list.push(currentTabName)
            tabMap[currentTabName] = {
              attrs: {
                ...parseAttrs(attrs?.trim() || null),
                lang,
              },
              content: [],
            }
          }
        }
      } else if (currentTabName !== null) {
        // Add the line to the current tab's content
        tabMap[currentTabName]?.content.push(line)
      }
      // else {
      //   console.log('Skipping non-tab line:', line);
      // }
    }

    if (list.length === 0) return

    return {
      param: `[ ${list.map((tab) => `'${tab}'`).join(', ')} ]`,
      content: list
        .map((tabName) => {
          const props = tabMap[tabName]
          if (props) {
            return (
              `<${tabPanelTagName} class="${tabPanelTagClass}" name="${tabName}">` +
              getHighlightedContent(props.content.join('\n'), props.attrs) +
              `</${tabPanelTagName}>`
            )
          }
          return ''
        })
        .join('\n'),
    }
  }

  function extractCodeLineProps(
    lines: string[],
    attrs: Record<string, string | undefined>,
  ): Record<string, string[]> {
    const acc: Record<string, string[]> = {}

    for (const type of magicCommentList) {
      acc[type] = attrs[type] !== void 0 ? attrs[type].split(',') : []
    }

    lines.forEach((line, lineIndex) => {
      const match = line.match(magicCommentRE)
      if (match !== null && match.groups) {
        const { type } = match.groups
        if (type && type in acc) {
          acc[type]!.push('' + (lineIndex + 1))
        }
      }
    })

    return acc
  }

  type LineProps = {
    prefix: string[]
    classList: string[]
  }

  function parseCodeLine(content: string, attrs: Record<string, any>): LineProps[] {
    // Normalize line endings to just "\n"
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    const lines = normalized.split('\n')

    // Extract code line properties
    const props = extractCodeLineProps(lines, attrs)
    const acc: LineProps[] = lines.map(() => ({ prefix: [], classList: [] }))

    const hasRemOrAdd = (props.rem?.length || 0) > 0 || (props.add?.length || 0) > 0

    for (const type of magicCommentList) {
      const target = props[type]
      if (target) {
        for (const value of target) {
          const [fromStr, toStr] = value.split('-')
          const from = parseInt(String(fromStr), 10)
          const to = toStr ? parseInt(toStr, 10) : from

          if (!isNaN(from) && !isNaN(to)) {
            for (let i = from; i <= to; i++) {
              if (acc[i - 1]) {
                acc[i - 1]!.classList.push(`${linePrefixClass}${type}`)
              }
            }
          }
        }
      }
    }

    if (attrs.numbered === true) {
      const lineCount = String(lines.length).length
      lines.forEach((_, lineIndex) => {
        if (acc[lineIndex]) {
          acc[lineIndex].prefix.push(String(lineIndex + 1).padStart(lineCount, ' '))
        }
      })
    }

    if (hasRemOrAdd) {
      lines.forEach((_, lineIndex) => {
        const target = acc[lineIndex]
        if (target) {
          target.prefix.push(
            target.classList.includes(`${linePrefixClass}add`) // was c-add
              ? '+'
              : target.classList.includes(`${linePrefixClass}rem`) // was c-rem
                ? '-'
                : ' ',
          )
        }
      })
    }

    return acc
  }

  function getHighlightedContent(rawContent: string, attrs: any): string {
    const { lang = defaultLang, maxheight } = attrs
    const content = rawContent.trim()
    const lineList = parseCodeLine(content, attrs)

    const grammar = prism.languages[lang || defaultLang]

    const html = prism
      .highlight(content.replace(magicCommentGlobalRE, ''), grammar, lang)
      .split('\n') // split into individual lines
      .map((line: string, lineIndex: number) => {
        const target = lineList[lineIndex]

        let lineHtml = ''
        // TODO: we will deal with the c-line and c-lpref classes later
        if (target) {
          if (target.classList.length !== 0) {
            lineHtml += `<span class="c-line ${target.classList.join(' ')}"></span>`
          }
          if (target.prefix.length !== 0) {
            lineHtml += `<span class="c-lpref">${target.prefix.join(' ')}</span>`
          }
        }

        // Add the line content
        lineHtml += line
        return lineHtml
      })
      .join('\n')

    const langClass = lang === 'css' ? ' language-css' : ` language-${lang}`
    const preAttrs = maxheight !== void 0 ? ` style="max-height:${maxheight}"` : ''

    const langProp = customCopyLangList.includes(lang) === true ? ` lang="${lang}"` : ''

    // add v-pre for Vue
    const results =
      `<pre v-pre class="${preClass}${langClass}"${preAttrs}><code${codeClass ? ` class="${codeClass}"` : ''}>${grammar ? html : rawContent}</code></pre>` +
      (copyButtonComponent ? `<${copyButtonComponent} ${langProp} />` : '')

    return results
  }

  type DefinitionLine = {
    lang: string
    title: string | null
    attrs?: { [x: string]: any }
    tabs?: { param: string; content: string }
  }

  function parseDefinitionLine(token: { info: string; content: string }): DefinitionLine {
    const match = token.info.trim().match(definitionLineRE)

    if (match === null) {
      return {
        lang: defaultLang,
        title: null,
      }
    }

    const { groups } = match
    const acc: {
      lang: string
      title: string | null
      attrs?: { [x: string]: any }
      tabs?: { param: string; content: string }
    } = {
      ...parseAttrs(groups?.attrs?.trim() || null),
      lang: groups?.lang || defaultLang,
      title: groups?.title?.trim() || null,
    }

    if (acc.lang === 'tabs') {
      const tabs = extractTabs(token.content)
      if (tabs) {
        acc.tabs = tabs
      }
    }

    return acc
  }

  // const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (
    tokens: Token[],
    idx: number,
    _options: Options,
    env: MarkdownItEnv,
  ): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }
    const attrs = parseDefinitionLine(token)

    // add pageScripts if found
    if (pageScripts.length > 0) {
      if (!env.pageScripts) {
        // Initialize pageScripts as a Set if it doesn't exist yet
        env.pageScripts = new Set<string>()
      }

      // Add the scripts into env.pageScripts
      for (const script of pageScripts) {
        env.pageScripts.add(script)
      }
    }

    return (
      `<${containerComponent}${attrs.title !== null ? ` title="${attrs.title}"` : ''}${
        'tabs' in attrs && attrs.tabs !== undefined ? ` :tabs="${attrs.tabs.param}"` : ''
      }>` +
      ('tabs' in attrs && attrs.tabs !== undefined
        ? attrs.tabs.content
        : getHighlightedContent(token.content, attrs)) +
      `</${containerComponent}>`
    )
  }
}
