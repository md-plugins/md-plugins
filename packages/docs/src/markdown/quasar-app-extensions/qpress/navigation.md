---
title: Q-Press Navigation
desc: Configure Q-Press header menus, sidebar navigation, footer links, and route paths.
related:
  - quasar-app-extensions/qpress/site-config
  - quasar-app-extensions/qpress/landing-page
  - quasar-app-extensions/qpress/overview
---

Q-Press navigation is driven by `src/siteConfig/index.ts`. Header and footer menus usually use direct route paths, while sidebar menus often use slugified grouping nodes.

## Route Paths

For each Markdown file in `src/markdown`, Vue Router generates a matching route:

```txt
src/markdown/getting-started/introduction.md
  -> /getting-started/introduction

src/markdown/quasar-app-extensions/qpress/site-config.md
  -> /quasar-app-extensions/qpress/site-config
```

If the folder name and file name are the same, Q-Press removes the duplicate segment:

```txt
src/markdown/vite-plugins/vite-md-plugin/vite-md-plugin.md
  -> /vite-plugins/vite-md-plugin
```

Use these route paths in header links, sidebar children, related links, and card links.

The landing page is the source-file exception. Link to it as `/`, even though the file is named `src/markdown/landing-page.md`. See [Customizing The Landing Page](/quasar-app-extensions/qpress/landing-page) for the page-specific setup.

## Navigation Regions

| Region    | Configure with                                                              | Best for                                                           |
| --------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Header    | `links.primaryHeaderLinks`, `links.secondaryHeaderLinks`                    | High-priority sections and short route groups.                     |
| More menu | `links.moreLinks`                                                           | Header items that should collapse at smaller widths.               |
| Sidebar   | `sidebar`                                                                   | Full documentation outline and nested sections.                    |
| Footer    | `links.footerLinks`, `links.socialLinks`, `license`, `privacy`, `copyright` | Sponsor links, external references, legal links, and social links. |

## Menu Groups

Create top-level menu groups in `src/siteConfig/index.ts`:

```ts [twoslash]
const mdPluginsMenu = {
  name: 'MD Plugins',
  mq: 600,
  children: [
    {
      name: 'Blockquote',
      children: [
        { name: 'Overview', path: '/md-plugins/blockquote/overview' },
        { name: 'Advanced', path: '/md-plugins/blockquote/advanced' },
      ],
    },
    {
      name: 'Codeblocks',
      children: [
        { name: 'Overview', path: '/md-plugins/codeblocks/overview' },
        { name: 'Advanced', path: '/md-plugins/codeblocks/advanced' },
      ],
    },
  ],
}
```

Use `mq` to decide when a menu should move into the `More` menu. Match those breakpoints to the values in your Q-Press theme variables. See [Themes](/quasar-app-extensions/qpress/themes#media-query-breakpoints).

## MenuItem Type

```ts [twoslash]
interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[] | undefined
  external?: boolean
  expanded?: boolean
}
```

| Property                                           | Use it for                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `name`                                             | Visible label for the link or group.                                        |
| `path`                                             | Internal route path, external URL, or `''` for a visual-only sidebar group. |
| `icon`, `iconColor`, `rightIcon`, `rightIconColor` | Header, sidebar, footer, or card-style link decoration.                     |
| `badge`                                            | Small status label beside a menu item.                                      |
| `children`                                         | Nested menu groups.                                                         |
| `external`                                         | Opens links with external-link behavior.                                    |
| `expanded`                                         | Initial expansion state for sidebar groups.                                 |
| `mq`                                               | Responsive breakpoint used to show or hide header items.                    |
| `image`, `maxWidth`                                | Image-style footer or sponsor links.                                        |

## Sidebar Trees

Sidebar menu items represent drawer sections instead of flat header links. Use the `sidebar` export in Site Config to control drawer navigation.

When a header menu already has the structure you want, process it into a sidebar-safe tree:

```ts
function getSidebarPath(item: MenuItem): string {
  if (item.path === '') {
    return ''
  }

  const path = item.path?.replace(/^\/+/, '').split('/').filter(Boolean).pop()
  return path ?? slugify(item.name)
}

function processMenuItem(item: MenuItem): MenuItem {
  return {
    name: item.name,
    path: getSidebarPath(item),
    expanded: item.expanded ?? false,
    children: item.children ? item.children.map(processMenuItem) : undefined,
  }
}
```

Then add the processed menu to `sidebar`:

```ts
export const sidebar = [
  processedMdPluginsMenu,
  processedVitePluginsMenu,
  processedQuasarAppExts,
  processedOtherMenu,
]
```

Use `path: ''` when a sidebar item is only a visual grouping node and should not contribute a URL segment. This keeps grouped children under their real route instead of creating a route such as `/examples/agenda/recipes/planner`.

```ts
const examplesMenu = {
  name: 'Examples',
  path: '/examples',
  children: [
    {
      name: 'Agenda',
      path: '/examples/agenda',
      children: [
        {
          name: 'Recipes',
          path: '',
          children: [{ name: 'Planner', path: '/examples/agenda/planner' }],
        },
      ],
    },
  ],
} satisfies MenuItem
```

Reserve `path: ''` for sidebar-only grouping nodes. Real pages and header links should keep explicit route paths.

## More Links

The `moreLinks` array controls the responsive overflow menu. Items are displayed based on media query breakpoints and are removed from the normal header menu when they no longer fit.

```ts [twoslash]
const guidesMenu = {
  name: 'Guides',
  mq: 780,
  children: [
    { name: 'Installation', path: '/getting-started/installation' },
    { name: 'Themes', path: '/quasar-app-extensions/qpress/themes' },
  ],
}

const links = {
  secondaryHeaderLinks: [guidesMenu],
  moreLinks: [guidesMenu],
}
```
