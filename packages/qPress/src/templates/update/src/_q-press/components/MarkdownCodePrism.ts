import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import htmlLang from 'shiki/langs/html.mjs'
import javascriptLang from 'shiki/langs/javascript.mjs'
import vueLang from 'shiki/langs/vue.mjs'
import githubDark from 'shiki/themes/github-dark.mjs'
import githubLight from 'shiki/themes/github-light.mjs'
import { h, computed, defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'MarkdownCodePrism',

  props: {
    code: {
      type: String as PropType<string>,
      required: true,
    },
    lang: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup(props) {
    const block = computed(() => {
      return parseHighlightedBlock(highlightCode(props.code, props.lang))
    })

    return () =>
      h(
        'pre',
        {
          class: ['markdown-code', block.value.className],
          style: block.value.style,
        },
        [h('code', { innerHTML: block.value.code })],
      )
  },
})

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  themes: [githubLight, githubDark],
  langs: [htmlLang, javascriptLang, vueLang].flat(),
  langAlias: {
    bash: 'javascript',
    css: 'html',
    js: 'javascript',
    markup: 'vue',
    sass: 'html',
    scss: 'html',
    sh: 'javascript',
    shell: 'javascript',
    ts: 'javascript',
  },
})

function highlightCode(code: string, lang: string): string {
  const options = {
    lang: normalizeLang(lang),
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    defaultColor: false,
  } as const

  try {
    return highlighter.codeToHtml(code, options)
  } catch {
    return highlighter.codeToHtml(code, {
      ...options,
      lang: 'text',
    })
  }
}

function normalizeLang(lang: string): string {
  return (
    {
      js: 'javascript',
      markup: 'html',
      ts: 'typescript',
    }[lang] ?? lang
  )
}

function parseHighlightedBlock(html: string): { className: string; code: string; style: string } {
  const match = html.match(/^<pre(?<attrs>[^>]*)><code>(?<code>[\s\S]*)<\/code><\/pre>$/)
  const attrs = match?.groups?.attrs ?? ''

  return {
    className: attrs.match(/class="(?<value>[^"]*)"/)?.groups?.value ?? 'shiki',
    code: match?.groups?.code ?? '',
    style: attrs.match(/style="(?<value>[^"]*)"/)?.groups?.value ?? '',
  }
}
