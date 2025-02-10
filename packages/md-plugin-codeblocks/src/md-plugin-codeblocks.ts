import MarkdownIt from 'markdown-it'
import type { PluginWithOptions, Options } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { CodeblockPluginOptions, Lang } from './types'
import prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'

/**
 * A list of default programming languages supported by Prism.
 * Each language in the list has a name and can optionally specify aliases and whether it has a custom copy button.
 */
const defaultLangList: Lang[] = [
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
  { name: 'diff' }, // special grammars
]

export const codeblocksPlugin: PluginWithOptions<CodeblockPluginOptions> = (
  md: MarkdownIt,
  {
    defaultLang = 'markup',
    containerComponent = 'MarkdownPrerender',
    copyButtonComponent = 'MarkdownCopyButton',
    preClass = 'markdown-code',
    codeClass = '',
    tabPanelTagName = 'q-tab-panel',
    tabPanelTagClass = 'q-pa-none',
    pageScripts = [
      "import MarkdownPrerender from 'src/.q-press/components/MarkdownPrerender'", // ts file
      "import MarkdownCopyButton from 'src/.q-press/components/MarkdownCopyButton.vue'",
    ],
    langList = defaultLangList,
  }: CodeblockPluginOptions = {},
): void => {
  const customCopyLangList = langList.filter((l) => l.customCopy === true).map((l) => l.name)

  loadLanguages(langList.map((l) => l.name))

  const langMatch = langList.map((l) => l.aliases || l.name).join('|')

  /**
   * A regular expression pattern that matches the definition line for a code block with optional language and attributes.
   * The pattern captures the following groups:
   * - `lang`: The language of the code block, which can be either "tabs" or one of the languages specified in the `langMatch` variable.
   * - `attrs`: Any optional attributes specified for the code block, enclosed in square brackets.
   *       * numbered - lines are numbered
   *       * highlight=1,2-4,6 - highlight lines
   *       * add=1,2-4,6 - add lines
   *       * rem=1,2-4,6 - remove lines
   *       * maxheight=200px - set max height
   * - `title`: An optional title for the code block.
   */
  const definitionLineRE = new RegExp(
    '^' +
      `(?<lang>(tabs|${langMatch}))` +
      '(\\s+\\[(?<attrs>.*)\\])?' +
      '(\\s+(?<title>.+))?' +
      '$',
  )

  const tabsLineRE = new RegExp(
    '^<<\\|\\s+' +
      `(?<lang>${langMatch})` +
      '(\\s+\\[(?<attrs>.*)\\])?' +
      '(\\s+(?<title>.+))?' +
      '\\s*\\|>>$',
  )

  interface TabMap {
    [key: string]: {
      attrs: { [key: string]: any }
      content: string[]
    }
  }

  function extractTabs(content: string) {
    const list: string[] = []
    const tabMap: TabMap = {}

    let currentTabName: string | null = null

    for (const line of content.split('\n')) {
      const tabsMatch = line.match(tabsLineRE)

      if (tabsMatch !== null) {
        const { lang, attrs, title } = tabsMatch.groups || {}

        currentTabName = title?.trim() || `Tab ${list.length + 1}`

        list.push(currentTabName)
        tabMap[currentTabName] = {
          attrs: {
            ...parseAttrs(attrs?.trim() || null),
            lang,
          },
          content: [],
        }
      } else if (currentTabName) {
        tabMap[currentTabName].content.push(line)
      }
    }

    if (list.length === 0) return

    return {
      param: `[ ${list.map((tab) => `'${tab}'`).join(', ')} ]`,
      content: list
        .map((tabName) => {
          const props = tabMap[tabName]
          return (
            `<${tabPanelTagName} class="${tabPanelTagClass}" name="${tabName}">` +
            getHighlightedContent(props!.content.join('\n'), props.attrs) +
            `</${tabPanelTagName}>`
          )
        })
        .join('\n'),
    }
  }

  const magicCommentList = ['highlight', 'rem', 'add']
  const magicCommentRE = new RegExp(` *\\[\\[! (?<type>(${magicCommentList.join('|')}))\\]\\] *`)
  const magicCommentGlobalRE = new RegExp(magicCommentRE, 'g')

  interface CodeLineProps {
    prefix: string[]
    classList: string[]
  }

  function extractCodeLineProps(lines: string[], attrs: { [key: string]: any }) {
    const acc: { [key: string]: string[] } = {}

    for (const type of magicCommentList) {
      acc[type] = attrs[type] !== void 0 ? attrs[type].split(',') : []
    }

    lines.forEach((line, lineIndex) => {
      const match = line.match(magicCommentRE)

      if (match !== null) {
        const type = match.groups?.type
        if (type !== undefined) {
          acc[type].push('' + (lineIndex + 1))
        }
      }
    })

    return acc
  }

  function parseCodeLine(content: string, attrs: { [key: string]: any }) {
    const lines = content.split('\n')

    const acc: CodeLineProps[] = lines.map(() => ({
      prefix: [],
      classList: [],
    }))

    if (attrs.lang === 'markup') {
      return acc
    }

    const props = extractCodeLineProps(lines, attrs)

    const hasRemOrAdd = props.rem.length !== 0 || props.add.length !== 0

    for (const type of magicCommentList) {
      const target = props[type]
      if (target === void 0 || target.length === 0) continue

      for (const value of target) {
        let [from, to] = value.split('-').map((i) => parseInt(i, 10))
        if (from === void 0) continue
        if (to === void 0) to = from

        for (let i = from; i <= to; i++) {
          acc[i - 1].classList.push(`line-${type}`)
        }
      }
    }

    if (attrs.numbered === true) {
      const lineCount = ('' + lines.length).length

      lines.forEach((_, lineIndex) => {
        acc[lineIndex].prefix.push(('' + (lineIndex + 1)).padStart(lineCount, ' '))
      })
    }

    hasRemOrAdd === true &&
      lines.forEach((_, lineIndex) => {
        const target = acc[lineIndex]
        if (target === void 0) return
        target.prefix.push(
          target.classList.includes(`line-add`) === true
            ? '+'
            : target.classList.includes(`line-rem`) === true
              ? '-'
              : ' ',
        )
      })

    return acc
  }

  function renderCodeBlock(html: string, codeClass?: string): string {
    return `<code${codeClass ? ` class="${codeClass}"` : ''}>${html}</code>`
  }

  function getPrismHighlightedContent(rawContent: string, lang: string) {
    const content = rawContent.trim()
    return prism.highlight(content, prism.languages[lang] as Prism.Grammar, lang)
  }

  function getHighlightedContent(rawContent: string, attrs: { [key: string]: any }) {
    const { lang, maxheight } = attrs

    let content = rawContent.trim()
    const lineList = parseCodeLine(content, attrs)

    if (lang !== 'markup') {
      content = content.trim().replace(magicCommentGlobalRE, '')
    }

    const html = prism
      .highlight(content, prism.languages[lang] as Prism.Grammar, lang)
      .split('\n')
      .map((line, lineIndex) => {
        const target = lineList[lineIndex]

        if (target === void 0) return line
        let lineHtml = ''
        lineHtml +=
          target.classList.length !== 0
            ? `<span class="c-line ${target.classList.join(' ')}"></span>`
            : ''
        lineHtml +=
          target.prefix.length !== 0
            ? `<span class="c-lpref">${target.prefix.join(' ')}</span>`
            : ''
        lineHtml += line
        return lineHtml
      })
      .join('\n')

    // langClass is causing interference with numbers, add, rem, etc
    // commenting out for now
    // const langClass = lang === 'css' ? ' language-css' : ` language-${lang}`

    const preAttrs = maxheight !== void 0 ? ` style="max-height:${maxheight}"` : ''

    const langProp = customCopyLangList.includes(lang) === true ? ` lang="${lang}"` : ''

    return (
      // `<pre v-pre class="${preClass}${langClass}"${preAttrs}>` +
      `<pre v-pre class="${preClass}"${preAttrs}>` +
      renderCodeBlock(html, codeClass) +
      `</pre><${copyButtonComponent}${langProp} />`
    )
  }

  function parseAttrs(rawAttrs: string | null) {
    if (rawAttrs === null) return {}

    const acc: { [key: string]: any } = {}
    const attrList = rawAttrs.split(/\s+/)

    for (const attr of attrList) {
      const [key, value] = attr.split('=')
      acc[(key as string).trim()] = value?.trim() || true
    }

    return acc
  }

  function parseDefinitionLine(token: Token) {
    const match = token.info.trim().match(definitionLineRE)

    if (match === null) {
      return {
        lang: 'markup',
        title: null,
      }
    }

    const { lang, attrs, title } = match.groups || {}
    const acc: { lang: string; title: string | null; tabs?: any } = {
      ...parseAttrs(attrs?.trim() || null),
      lang: lang as string,
      title: title?.trim() || null,
    }

    if (acc.lang === 'tabs') {
      acc.tabs = extractTabs(token.content)
    }

    return acc
  }

  md.renderer.rules.fence = (
    tokens: Token[],
    idx: number,
    _options: Options,
    env: MarkdownItEnv,
  ) => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    if (token.info === '') {
      token.info = defaultLang
    }

    if (pageScripts.length > 0) {
      env.pageScripts = env.pageScripts || new Set<string>()
      for (const script of pageScripts) {
        env.pageScripts.add(script)
      }
    }

    const attrs = parseDefinitionLine(token)

    return (
      `<${containerComponent}${attrs.title !== null ? ` title="${attrs.title}"` : ''}${attrs.tabs !== void 0 ? ` :tabs="${attrs.tabs.param}"` : ''}>` +
      (attrs.tabs !== void 0 ? attrs.tabs.content : getHighlightedContent(token.content, attrs)) +
      `</${containerComponent}>`
    )
  }
}
