// import md from './md.js'
import type { MarkdownItEnv } from '@md-plugins/shared'
import { getVueComponent } from './md-loader-utils.js'
import type { MenuItem, MarkdownOptions } from './types.js'
import { createMarkdownRenderer } from './md'
import { flattenOptions, type MarkdownParserOptions } from './flat-options.js'

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
 * @returns An object containing the generated Vue component code and a null source map.
 *
 * The function performs the following steps:
 * 1. Creates an environment object to store metadata about the page, including the page ID and a set of page scripts to be imported.
 * 2. Pre-processes the Markdown code to check for the presence of various custom components (MarkdownApi, MarkdownTree) and adds them to the set of page scripts.
 * 3. Renders the Markdown code to HTML using the `md.render()` function, passing the environment object as a second argument.
 * 4. Post-processes the environment object, checking for the presence of examples and the MarkdownLink component, and adding them to the set of page scripts.
 * 5. Generates a Vue component using the `getVueComponent()` function, passing the rendered HTML, the original Markdown code, and the page ID.
 * 6. Returns an object containing the generated Vue component and a `null` source map (as no source map is provided).
 */
export function mdParse(
  code: string,
  id: string,
  prefix: string,
  menu: MenuItem[],
  options: MarkdownOptions = {},
): { code: string } {
  const env: MarkdownItEnv = {
    frontmatter: {
      id: id,
    },
    pageScripts: new Set<string>(),
  } // Environment for storing metadata

  // pre-processing
  env.pageScripts!.add("import MarkdownPage from 'src/.q-press/layouts/MarkdownPage.vue'")
  if (markdownApiRE.test(code) === true) {
    env.pageScripts!.add("import MarkdownApi from 'src/.q-press/components/MarkdownApi.vue'")
  }
  if (markdownTreeRE.test(code) === true) {
    env.pageScripts!.add("import MarkdownTree from 'src/.q-press/components/MarkdownTree.vue'")
  }

  const flatOptions: MarkdownParserOptions = flattenOptions(options)

  // create the markdown renderer and pass options
  const md = createMarkdownRenderer(flatOptions)

  // render the markdown code to HTML, gather all other info (ex: frontmatter, etc)
  const results = md.render(code, env)

  // post-processing
  if (env.frontmatter!.examples !== void 0) {
    env.pageScripts!.add(
      "import MarkdownExample from 'src/.q-press/components/MarkdownExample.vue'",
    )
  }
  if (markdownLinkRE.test(code) === true) {
    env.pageScripts!.add("import MarkdownLink from 'src/.q-press/components/MarkdownLink.vue'")
  }

  const component = getVueComponent(results, code, id, prefix, menu)

  return {
    code: component,
  }
}
