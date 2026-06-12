import { convertToRelated, generateFlatMenu } from './flat-menu'
import type { TocItem } from '@md-plugins/md-plugin-headers'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { MenuItem, NavItem, FlatMenu, FlatMenuEntry } from './types'

/**
 * Extracts `<script import>` blocks from rendered Markdown HTML.
 *
 * @param mdPageContent - The full Markdown content of the page.
 * @returns An object containing the Markdown content and a set of user scripts.
 */
export function splitRenderedContent(mdPageContent: string) {
  const scriptRE = /<script import>\n((.|\n)*?)\n<\/script>/g

  const userScripts = new Set()

  const mdContent = mdPageContent.replace(scriptRE, (_, p1) => {
    userScripts.add(p1)
    return ''
  })

  return { mdContent, userScripts }
}

/**
 * Adds previous/next navigation metadata for a Markdown page when it exists in the menu.
 */
function createNav(id: string, env: MarkdownItEnv, flatMenu?: FlatMenu): void {
  if (flatMenu) {
    const menuItem: FlatMenuEntry | undefined = flatMenu[id]
    const nav: NavItem[] = []

    if (menuItem !== void 0) {
      const { prev, next } = menuItem

      if (prev !== void 0) {
        nav.push({ ...prev, classes: 'markdown-page__related--left' })
      }
      if (next !== void 0) {
        nav.push({ ...next, classes: 'markdown-page__related--right' })
      }
    }

    if (nav.length > 0) {
      env.frontmatter!.nav = nav
    }
  }
}

/**
 * Converts TOC entries into the numbered structure consumed by MarkdownPageToc.
 */
function parseToc(toc: TocItem[]) {
  let wasHeader = true // Introduction is auto prepended
  let headerIndex = 1 // Introduction is auto prepended
  let subheaderIndex: number

  const list = toc.map((entry) => {
    if (entry.sub === true) {
      if (wasHeader === true) {
        subheaderIndex = 1
      } else {
        subheaderIndex++
      }

      wasHeader = false
    } else {
      wasHeader = true
      headerIndex++
    }

    return {
      ...entry,
      title:
        entry.sub === true
          ? `${headerIndex}.${subheaderIndex}. ${entry.title}`
          : `${headerIndex}. ${entry.title}`,
    }
  })

  return JSON.stringify(list)
}

/**
 * Wraps rendered Markdown HTML in the generated Vue page component used by Q-Press docs.
 */
export function getVueComponent(
  rendered: any,
  code: string,
  id: string,
  prefix: string,
  menu: MenuItem[],
) {
  let flatMenu: FlatMenu
  if (menu) {
    flatMenu = generateFlatMenu(prefix, menu)
    createNav(id, rendered.env, flatMenu)
  }
  const frontmatter = rendered?.frontmatter || {}

  // default is true, unless false is specifically set
  if (frontmatter.editLink !== false) {
    frontmatter.editLink = id.substring(id.indexOf('src/markdown/') + 13, id.length - 3)
  }

  const title = frontmatter.title || rendered.env.title || rendered.title || 'Generic Page'
  const desc = frontmatter.desc || false
  const fullscreen = frontmatter.fullscreen || false
  const overline = frontmatter.overline || false
  const heading = rendered.env.heading || false
  const related =
    (frontmatter.related &&
      Array.isArray(frontmatter.related) &&
      frontmatter.related.map((entry: string) => convertToRelated(prefix, flatMenu, entry, id))) ||
    false
  const nav = frontmatter.nav || false
  const badge = frontmatter.badge || false
  const toc = rendered.env.toc || false
  const editLink = frontmatter.editLink || false
  const scope = frontmatter.scope || false
  const examples = frontmatter.examples || false

  // console.log('toc:', toc)
  // console.log('env:', rendered.env)
  // console.log('related:', related)

  const { mdContent, userScripts } = splitRenderedContent(rendered.html)
  // oxfmt-ignore
  const pageScripts = [
    ...Array.from(rendered.env.pageScripts || []),
    ...Array.from(userScripts || []),
  ].join('\n')

  // console.log('components:', components)

  return `<template>
  <markdown-page
    title="${title}"
    ${desc !== false ? `desc="${desc}"` : ''}
    ${fullscreen !== false ? 'fullscreen' : ''}
    ${overline !== false ? `overline="${overline}"` : ''}
    ${badge !== false ? `badge="${badge}"` : ''}
    ${heading !== false ? 'heading' : ''}
    ${editLink !== false ? `edit-link="${editLink}"` : ''}
    ${toc !== false ? ':toc="toc"' : ''}
    ${related !== false ? ':related="related"' : ''}
    ${nav !== false ? ':nav="nav"' : ''}>${mdContent}</markdown-page>
</template>
<script setup>
import { copyHeading } from '@/.q-press/components/markdown-utils'
${
  examples !== false
    ? `
import { provide } from 'vue'
	provide('_markdown_examples_', import.meta.env.QUASAR_CLIENT
  ? { name: '${examples}', list: import('examples:${examples}') }
  : { name: '${examples}' })
`
    : ''
}
${related !== false ? `const related = ${JSON.stringify(related)}` : ''}
${nav !== false ? `const nav = ${JSON.stringify(nav)}` : ''}
${toc !== false ? `const toc = ${parseToc(toc)}` : ''}
${scope !== false ? `const scope = ${JSON.stringify(scope)}` : ''}
${pageScripts}
</script>`
}
