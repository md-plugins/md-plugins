import { join } from 'node:path'
import type { MenuItem, FlatMenu, FlatMenuEntry, RelatedItem } from './types'

let prev: FlatMenuEntry | null = null

/**
 * Recursively traverses the sidebar menu structure to build a flat menu representation.
 * This function populates the `flatMenu` object with entries and establishes prev/next relationships.
 *
 * @param node - The current menu node being processed
 * @param path - The accumulated path up to the current node
 * @param parentName - The name of the parent node, used as the category for the current node
 * @returns void
 */
function menuWalk(
  prefix: string,
  menuNodes: FlatMenu,
  node: MenuItem,
  path: string,
  parentName: string | null,
): void {
  const newPath = path + (node.path ? `/${node.path}` : '')

  if (node.children) {
    node.children.forEach((childNode) => {
      menuWalk(prefix, menuNodes, childNode, newPath, node.name)
    })
  } else if (!node.external) {
    const current: FlatMenuEntry = {
      name: node.name,
      category: parentName,
      path: newPath,
    }

    if (prev) {
      prev.next = {
        name: current.name,
        category: current.category,
        path: current.path,
      }
      current.prev = {
        name: prev.name,
        category: prev.category,
        path: prev.path,
      }
    }

    // Add entries to menuNodes
    menuNodes[join(prefix, newPath + '.md')] = current
    // Handle folder-based menu structures
    if (node.path) {
      menuNodes[join(prefix, newPath + '/' + node.path + '.md')] = current
    }

    prev = current
  }
}

/**
 * Flattens a nested sidebar menu and records previous/next relationships.
 */
export function generateFlatMenu(prefix: string, menu: MenuItem[]): FlatMenu {
  const menuNodes: FlatMenu = {}
  prev = null
  if (menu) {
    menu.forEach((node) => {
      menuWalk(prefix, menuNodes, node, '', null)
    })
  }
  return menuNodes
}

/**
 * Looks up a Markdown related-page entry from the flattened sidebar menu.
 */
export function convertToRelated(
  prefix: string,
  menuNodes: FlatMenu,
  entry: string,
  id: string,
): RelatedItem {
  const menuEntry = menuNodes[join(prefix, entry + '.md')]

  if (!menuEntry) {
    console.error('[flat-menu] ERROR - wrong related link:', entry, '@id', id)
    return {
      name: '',
      category: '',
      path: '',
    } as RelatedItem
  }

  return {
    name: menuEntry.name,
    category: menuEntry.category,
    path: menuEntry.path,
  } as RelatedItem
}
