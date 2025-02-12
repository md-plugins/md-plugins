import type { Options } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import MarkdownIt from 'markdown-it'

import type { MarkdownItEnv } from '@md-plugins/shared'
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter'
import { importsPlugin } from '@md-plugins/md-plugin-imports'
import { headersPlugin } from '@md-plugins/md-plugin-headers'
import { linkPlugin } from '@md-plugins/md-plugin-link'
import { inlinecodePlugin } from '@md-plugins/md-plugin-inlinecode'
import { imagePlugin } from '@md-plugins/md-plugin-image'
import { codeblocksPlugin } from '@md-plugins/md-plugin-codeblocks'
import { blockquotePlugin } from '@md-plugins/md-plugin-blockquote'
import { tablePlugin } from '@md-plugins/md-plugin-table'
import { titlePlugin } from '@md-plugins/md-plugin-title'
import type {
  ContainerDetails,
  CreateContainerFn,
  Container,
  ContainerOptions,
} from '@md-plugins/md-plugin-containers'
import { containersPlugin } from '@md-plugins/md-plugin-containers'
import type { MarkdownParserOptions } from './flat-options'

export type MarkdownRenderer = MarkdownIt

export interface MarkdownRenderResult {
  html: string
  frontmatter: Record<string, any>
  title: string
  env: MarkdownItEnv
}

export interface MarkdownRendererResult {
  render(code: string, env: MarkdownItEnv): MarkdownRenderResult
}

/**
 * Creates a container for custom markdown rendering.
 *
 * This function sets up a container with specific rendering logic for different types of content blocks.
 * It's particularly useful for creating custom containers like tips, warnings, or details in markdown.
 *
 * @param container - The container object to be configured.
 * @param containerType - The type of the container (e.g., 'tip', 'warning', 'details').
 * @param defaultTitle - The default title to use if no specific title is provided in the markdown.
 * @param md - The MarkdownIt instance used for rendering.
 * @returns A tuple containing the configured container, the container type, and rendering options.
 */
const createContainer: CreateContainerFn = (
  container: Container,
  containerType: string,
  defaultTitle: string,
  md: MarkdownIt,
): [Container, string, ContainerOptions] => {
  const containerTypeLen = containerType.length

  return [
    container,
    containerType,
    {
      render(tokens: Token[], idx: number): string {
        const token = tokens[idx]
        if (!token) {
          return ''
        }

        // Get the title from token info or use defaultTitle
        const rawTitle = token.info.trim().slice(containerTypeLen).trim() || defaultTitle

        // Process the title as inline markdown
        const titleHtml = md ? md.renderInline(rawTitle) : rawTitle

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${titleHtml}</summary>\n`
            : '</details>\n'
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${titleHtml}</p>\n`
          : '</div>\n'
      },
    },
  ]
}

/**
 * Creates a markdown renderer with customized plugins and configurations.
 *
 * This function sets up a MarkdownIt instance with various plugins for enhanced
 * markdown rendering, including support for frontmatter, custom containers,
 * code blocks, tables, and more.
 *
 * @param options - Optional configuration options for the MarkdownIt instance.
 *                  These options will be merged with the default settings.
 * @returns An object with a render method that processes markdown content.
 *          The render method returns an object containing:
 *          - html: The rendered HTML content
 *          - frontmatter: Extracted frontmatter data
 *          - title: Extracted title
 *          - env: The MarkdownIt environment object
 */
export function createMarkdownRenderer(
  options: MarkdownParserOptions = {},
): MarkdownRendererResult {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...options,
    breaks: true,
  })

  md.use(frontmatterPlugin, { ...options })
  md.use(importsPlugin)
  md.use(titlePlugin)
  md.use(headersPlugin, { level: [2, 3], ...options })

  // md.use(tocPlugin)

  const containers: ContainerDetails[] = [
    { type: 'tip', defaultTitle: 'TIP' },
    { type: 'warning', defaultTitle: 'WARNING' },
    { type: 'danger', defaultTitle: 'WARNING' },
    { type: 'details', defaultTitle: 'Details' },
  ]

  md.use(containersPlugin, containers, createContainer, md)
  md.use(blockquotePlugin, { blockquoteClass: 'markdown-note', ...options })
  md.use(tablePlugin, {
    tableClass: 'markdown-table',
    tableHeaderClass: 'text-left',
    tableToken: 'q-markup-table',
    tableAttributes: [
      [':wrap-cells', 'true'],
      [':flat', 'true'],
      [':bordered', 'true'],
    ],
    ...options,
  })

  md.use(codeblocksPlugin, {
    containerComponent: 'MarkdownPrerender',
    copyButtonComponent: 'MarkdownCopyButton',
    pageScripts: [
      "import MarkdownPrerender from 'src/.q-press/components/MarkdownPrerender'",
      "import MarkdownCopyButton from 'src/.q-press/components/MarkdownCopyButton.vue'",
    ],
    ...options,
  })
  md.use(linkPlugin, { ...options })
  md.use(inlinecodePlugin, { ...options })
  md.use(imagePlugin, { ...options })

  return {
    // env: Environment for storing metadata
    render(code: string, env: MarkdownItEnv = {}): MarkdownRenderResult {
      const html = md.render(code, env)

      // NOTE: `env.content` holds the original markdown content
      //     : `env.html` holds the rendered HTML content

      return {
        html,
        frontmatter: env.frontmatter || {}, // comes from md_plugin_frontmatter
        title: env.title || '', // comes from md_plugin_title
        env,
      }
    },
  }
}
