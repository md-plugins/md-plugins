import type MarkdownIt from 'markdown-it'
import type { CreateContainerFn, ContainerDetails } from './types'
import container from 'markdown-it-container'

/**
 * Adds container support to a MarkdownIt instance.
 *
 * This function applies custom container plugins to the MarkdownIt parser.
 *
 * @param md - The MarkdownIt instance to which the container plugins will be added.
 * @param containers - An array of ContainerDetails objects, each specifying a container type and its default title.
 * @param createContainer - A function that creates and returns the container plugin configuration.
 *
 * @example
 * const containers: ContainerDetails[] = [
 *   { type: 'warning', defaultTitle: 'Warning' },
 *   { type: 'tip', defaultTitle: 'Tip' },
 *   { type: 'details', defaultTitle: 'Details' },
 * ];
 *
 * function createContainer(
 *   container: Container,
 *   containerType: string,
 *   defaultTitle: string
 *   md: MarkdownIt,
 * ): [Container, string, ContainerOptions] {
 *   const containerTypeLen = containerType.length;
 *
 *   return [
 *     container,
 *     containerType,
 *     {
 *       render(tokens: Token[], idx: number): string {
 *         const token = tokens[idx];
 *         // Get the title from token info or use defaultTitle
 *         const rawTitle = token.info.trim().slice(containerTypeLen).trim() || defaultTitle
 *
 *         // Process the title as inline markdown
 *         const titleHtml = md ? md.renderInline(rawTitle) : rawTitle
 *
 *         if (containerType === 'details') {
 *           return token.nesting === 1
 *             ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${titleHtml}</summary>\n`
 *             : '</details>\n';
 *         }
 *
 *         return token.nesting === 1
 *           ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${titleHtml}</p>\n`
 *           : '</div>\n';
 *       },
 *     },
 *   ];
 * }
 *
 */

export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle, md))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
