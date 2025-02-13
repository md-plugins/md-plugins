import type { MarkdownItEnv } from '@md-plugins/shared'
import { getVueComponent } from './md-loader-utils.js'
import type { MenuItem, MarkdownOptions } from './types.js'
import { createMarkdownRenderer } from './md'

const markdownLinkRE = /<MarkdownLink /
const markdownApiRE = /<MarkdownApi /
const markdownTreeRE = /<MarkdownTree /

/**
 * Parses Markdown code and generates a Vue component with rendered HTML and metadata.
 *
 * @param code - The Markdown code to be parsed.
 * @param id - The unique identifier for the page.
 * @param prefix - The prefix to be used in the generated Vue component.
 * @param menu - An array of MenuItem objects representing the navigation menu.
 * @returns An object containing the generated Vue component code.
 *
 * Note: The preProcess and postProcess hooks are called synchronously. If a waitable (async)
 * function is passed, its returned promise is not awaited.
 */
export function mdParse(
  code: string,
  id: string,
  prefix: string,
  menu: MenuItem[],
  options: MarkdownOptions = {},
): { code: string } {
  const env: MarkdownItEnv = {
    frontmatter: { id },
    pageScripts: new Set<string>(),
  }

  // Pre-processing: add default page scripts and detect custom components.
  env.pageScripts!.add("import MarkdownPage from 'src/.q-press/layouts/MarkdownPage.vue'")
  if (markdownApiRE.test(code)) {
    env.pageScripts!.add("import MarkdownApi from 'src/.q-press/components/MarkdownApi.vue'")
  }
  if (markdownTreeRE.test(code)) {
    env.pageScripts!.add("import MarkdownTree from 'src/.q-press/components/MarkdownTree.vue'")
  }

  // Call the preProcess hook if provided. (Note: This is synchronous.)
  if (typeof options.preProcess === 'function') {
    options.preProcess(env)
  }

  // Create the markdown renderer, passing along options.
  const md = createMarkdownRenderer(options)

  // Render the markdown code.
  const results = md.render(code, env)

  // Post-processing: add page scripts based on the rendered content.
  if (env.frontmatter!.examples !== undefined) {
    env.pageScripts!.add(
      "import MarkdownExample from 'src/.q-press/components/MarkdownExample.vue'",
    )
  }
  if (markdownLinkRE.test(code)) {
    env.pageScripts!.add("import MarkdownLink from 'src/.q-press/components/MarkdownLink.vue'")
  }

  // Call the postProcess hook if provided.
  if (typeof options.postProcess === 'function') {
    options.postProcess(env)
  }

  // Generate the Vue component.
  const component = getVueComponent(results, code, id, prefix, menu)

  return { code: component }
}
