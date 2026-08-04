import type { MarkdownItPluginWithOptions } from '@md-plugins/shared'
import type { MarkdownIt } from 'markdown-it'
import type { MarkdownItOptions } from 'markdown-it'
import type { Token } from 'markdown-it'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { CodeblockPluginOptions, Lang } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'
import {
  buildCodeBlockTransformers,
  highlighter,
  normalizeShikiLang,
  themeOptions,
  type CodeLineProps,
} from './shiki'

/**
 * A list of default programming languages supported by Shiki.
 * Each language in the list has a name and can optionally specify aliases and whether it has a custom copy button.
 */
const defaultLangList: Lang[] = [
  { name: 'markup' },
  { name: 'bash', customCopy: true },
  { name: 'javascript', aliases: 'javascript|js' },
  { name: 'typescript', aliases: 'typescript|ts' },
  { name: 'yaml', aliases: 'yaml|yml' },
  { name: 'sass' },
  { name: 'scss' },
  { name: 'css' },
  { name: 'json' },
  { name: 'xml' },
  { name: 'nginx' },
  { name: 'html' },
  { name: 'vue' },
  { name: 'diff' }, // special grammars
]

/** Default options for the codeblocks plugin */
const DEFAULT_CODEBLOCK_PLUGIN_OPTIONS: CodeblockPluginOptions = {
  defaultLang: 'markup',
  containerComponent: 'MarkdownPrerender',
  copyButtonComponent: 'MarkdownCopyButton',
  preClass: 'markdown-code',
  codeClass: '',
  tabPanelTagName: 'q-tab-panel',
  tabPanelTagClass: 'q-pa-none',
  pageScripts: [
    "import MarkdownPrerender from '@/.q-press/components/MarkdownPrerender'",
    "import MarkdownCopyButton from '@/.q-press/components/MarkdownCopyButton.vue'",
  ],
  langList: defaultLangList,
}

/**
 * Replaces Markdown fenced code blocks with highlighted Q-Press code components.
 *
 * The plugin supports language aliases, tabbed code fences, Shiki highlighting,
 * copy buttons, twoslash hints, line numbers, and add/remove/highlight notation.
 */
export const codeblocksPlugin: MarkdownItPluginWithOptions<CodeblockPluginOptions> = (
  md: MarkdownIt,
  options?: CodeblockPluginOptions | { codeblocksPlugin?: CodeblockPluginOptions },
): void => {
  // Resolve and merge plugin options (supports both global and direct usage)
  const resolvedOptions = resolvePluginOptions<CodeblockPluginOptions, 'codeblocksPlugin'>(
    options,
    'codeblocksPlugin',
    DEFAULT_CODEBLOCK_PLUGIN_OPTIONS,
  )

  // Provide fallback values during destructuring so that langList and pageScripts are always defined.
  const {
    defaultLang = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.defaultLang,
    containerComponent = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.containerComponent,
    copyButtonComponent = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.copyButtonComponent,
    preClass = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.preClass,
    codeClass = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.codeClass,
    tabPanelTagName = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.tabPanelTagName,
    tabPanelTagClass = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.tabPanelTagClass,
    pageScripts = DEFAULT_CODEBLOCK_PLUGIN_OPTIONS.pageScripts,
    langList = defaultLangList,
  } = resolvedOptions

  // Create a custom copy-language list
  const customCopyLangList = langList.filter((l) => l.customCopy === true).map((l) => l.name)

  // Build a regular expression to match a language from the list (or its aliases)
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
   *       * minheight=200px - set min height
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

  /**
   * Parses a `tabs` code fence into tab labels and rendered tab panel content.
   */
  function extractTabs(content: string) {
    const list: string[] = []
    const tabMap: TabMap = {}

    let currentTabName: string | null = null

    for (const line of content.split('\n')) {
      const tabsMatch = line.match(tabsLineRE)

      if (tabsMatch !== null) {
        const { lang, attrs, title } = tabsMatch.groups || {}
        const bareAttrs = extractBareAttrs(title?.trim() || null)

        currentTabName = bareAttrs.title ?? `Tab ${list.length + 1}`

        list.push(currentTabName)
        tabMap[currentTabName] = {
          attrs: {
            ...parseAttrs(attrs?.trim() || null),
            ...bareAttrs.attrs,
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
  const bareAttrList = ['twoslash']
  const magicCommentRE = new RegExp(` *\\[\\[! (?<type>(${magicCommentList.join('|')}))\\]\\] *`)
  const magicCommentGlobalRE = new RegExp(magicCommentRE, 'g')

  /**
   * Resolves add/remove/highlight line ranges from fence attributes and magic comments.
   */
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

  /**
   * Creates per-line decoration metadata consumed by the Shiki transformer chain.
   */
  function parseCodeLine(content: string, attrs: { [key: string]: any }): CodeLineProps[] {
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

    if (hasRemOrAdd === true) {
      lines.forEach((_, lineIndex) => {
        const target = acc[lineIndex]
        if (target === void 0) return
        target.prefix.push(
          target.classList.includes(`line-add`)
            ? '+'
            : target.classList.includes(`line-rem`)
              ? '-'
              : ' ',
        )
      })
    }

    return acc
  }

  /**
   * Highlights one code fence and appends the configured copy button component.
   */
  function getHighlightedContent(rawContent: string, attrs: { [key: string]: any }): string {
    const { lang, maxheight, minheight, twoslash } = attrs

    let content = rawContent.trim()
    const lineList = parseCodeLine(content, attrs)

    if (lang !== 'markup') {
      content = content.trim().replace(magicCommentGlobalRE, '')
    }

    const langProp = customCopyLangList.includes(lang) === true ? ` lang="${lang}"` : ''
    const codeProp = ` code="${md.utils.escapeHtml(content)}"`

    return (
      highlighter
        .codeToHtml(content, {
          lang: normalizeShikiLang(lang),
          ...themeOptions,
          transformers: buildCodeBlockTransformers({
            codeClass,
            lineList,
            maxheight,
            minheight,
            preClass: preClass ?? 'markdown-code',
            twoslash: twoslash === true || twoslash === 'true',
          }),
        })
        .replace('<pre ', '<pre v-pre ') + `<${copyButtonComponent}${langProp}${codeProp} />`
    )
  }

  /**
   * Parses square-bracket fence attributes such as `numbered`, `add=1`, `maxheight=20rem`, or `minheight=12rem`.
   */
  function parseAttrs(rawAttrs: string | null): { [key: string]: any } {
    if (rawAttrs === null) return {}

    const acc: { [key: string]: any } = {}
    const attrList = rawAttrs.split(/\s+/)

    for (const attr of attrList) {
      const [key, value] = attr.split('=')
      acc[(key as string).trim()] = value?.trim() || true
    }

    return acc
  }

  /**
   * Pulls supported bare attributes out of the code fence title text.
   */
  function extractBareAttrs(title: string | null): {
    attrs: { [key: string]: true }
    title: string | null
  } {
    if (title === null) {
      return {
        attrs: {},
        title: null,
      }
    }

    const attrs: { [key: string]: true } = {}
    const remainingTitle: string[] = []

    for (const chunk of title.split(/\s+/)) {
      if (remainingTitle.length === 0 && bareAttrList.includes(chunk)) {
        attrs[chunk] = true
        continue
      }

      remainingTitle.push(chunk)
    }

    return {
      attrs,
      title: remainingTitle.length > 0 ? remainingTitle.join(' ') : null,
    }
  }

  /**
   * Parses the fence info line into normalized rendering attributes.
   */
  function parseDefinitionLine(token: Token): { lang: string; title: string | null; tabs?: any } {
    const match = token.info.trim().match(definitionLineRE)

    if (match === null) {
      return {
        lang: 'markup',
        title: null,
      }
    }

    const { lang, attrs, title } = match.groups || {}
    const bareAttrs = extractBareAttrs(title?.trim() || null)
    const acc: { lang: string; title: string | null; tabs?: any } = {
      ...parseAttrs(attrs?.trim() || null),
      ...bareAttrs.attrs,
      lang: lang as string,
      title: bareAttrs.title,
    }

    if (acc.lang === 'tabs') {
      acc.tabs = extractTabs(token.content)
    }

    return acc
  }

  md.renderer.rules.fence = (
    tokens: Token[],
    idx: number,
    _options: Required<MarkdownItOptions>,
    env: MarkdownItEnv | undefined,
  ): string => {
    env ??= {}
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    if (token.info === '') {
      token.info = defaultLang ?? 'markup'
    }

    if (pageScripts && pageScripts.length > 0) {
      env.pageScripts = env.pageScripts || new Set<string>()
      for (const script of pageScripts) {
        env.pageScripts.add(script)
      }
    }

    const attrs = parseDefinitionLine(token)

    return (
      `<${containerComponent}${attrs.title !== null ? ` title="${attrs.title}"` : ''}${
        attrs.tabs !== void 0 ? ` :tabs="${attrs.tabs.param}"` : ''
      }>` +
      (attrs.tabs !== void 0 ? attrs.tabs.content : getHighlightedContent(token.content, attrs)) +
      `</${containerComponent}>`
    )
  }
}
