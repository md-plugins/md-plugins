---
title: Q-Press Site Config
desc: Site Config for the Q-Press App Extension for Quasar.
---

The Site Config lives in your `src/siteConfig/index.ts`. Here you can make changes to control the look and feel of your site.

## What Site Config Controls

Think of `src/siteConfig/index.ts` as the public contract for your docs shell. It controls identity, menus, footer links, GitHub edit links, CodePen setup, and which layout features are enabled.

| Section                                            | What it controls                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `title`, `description`, `theme`, `version`, `lang` | Browser metadata, visible product identity, and generated docs context.                            |
| `logoConfig`                                       | Header and sidebar logo behavior for light and dark mode.                                          |
| `versionConfig`                                    | Whether the title and version are shown in the header and drawer.                                  |
| `config`                                           | Major layout switches such as headers, footer, sidebar, table of contents, and the `More` menu.    |
| `links`                                            | Header links, responsive overflow links, footer links, social links, and optional ecosystem links. |
| `sidebar`                                          | Drawer/sidebar navigation tree.                                                                    |
| `githubEditRootSrc` and `githubSourceRootSrc`      | Source locations used by edit, source, and example links.                                          |
| `codepen`                                          | External CSS, scripts, setup code, and package globals used when examples open in CodePen.         |
| `license`, `privacy`, `copyright`                  | Footer legal links and ownership text.                                                             |
| `announcement`                                     | Optional dismissible top-of-page docs announcement.                                                |
| `privacyConsent`                                   | Optional privacy notice or consent prompt for static-hosted docs.                                  |
| `campaigns`                                        | Optional restrained popup/dialog campaigns with route, date, trigger, and frequency controls.      |

## Recommended Editing Flow

1. Update `title`, `description`, `theme`, logos, and version display first.
2. Add header menu groups in the `links` section.
3. Mirror the same content into `sidebar` when you want drawer navigation.
4. Add footer, sponsor, social, and ecosystem links after the main docs routes are in place.
5. Run the dev server and resize the page to verify `mq` breakpoints and `moreLinks` behavior.

## Route Paths

For each Markdown file in your `src/markdown` folder, Vue Router generates a matching route. When creating menus, use the same route path that the Markdown file generates.

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

## Menu System

Menus can be displayed in the header, drawer/sidebar, footer, or `More` overflow menu. Header and footer menus usually use direct route paths, while sidebar menus usually use slugified grouping nodes.

To create a top-level menu, create something similar to the following:

```ts [twoslash]
const mdPluginsMenu = {
  name: 'MD Plugins',
  mq: 600, // media query breakpoint
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

Be sure the media query breakpoint matches the one you set in your `src/css/quasar.variables.(scss|sass)` file. See [Themes](/quasar-app-extensions/qpress/themes#media-query-breakpoints) for more info.

Choose the toolbar and order you want the menu displayed on like this:

```ts
const secondaryToolbarLinks = [
  gettingStartedMenu,
  mdPluginsMenu, // <-- this is the menu we just created
  vitePluginsMenu,
  QuasarAppExts,
  otherMenu,
]
```

## MenuItem Type

A `MenuItem` looks like this, but not every option is used in every region:

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

const docsMenu = {
  name: 'Guides',
  expanded: true,
  children: [
    { name: 'Installation', path: '/getting-started/installation' },
    { name: 'Themes', path: '/quasar-app-extensions/qpress/themes' },
  ],
} satisfies MenuItem

const firstDocLink = docsMenu.children[0]
//    ^?

type MenuChildren = NonNullable<MenuItem['children']>
//   ^?
```

| Property                                           | Use it for                                               |
| -------------------------------------------------- | -------------------------------------------------------- |
| `name`                                             | Visible label for the link or group.                     |
| `path`                                             | Internal route path, external URL, or `''` for a visual-only sidebar group. |
| `icon`, `iconColor`, `rightIcon`, `rightIconColor` | Header, sidebar, footer, or card-style link decoration.  |
| `badge`                                            | Small status label beside a menu item.                   |
| `children`                                         | Nested menu groups.                                      |
| `external`                                         | Opens links with external-link behavior.                 |
| `expanded`                                         | Initial expansion state for sidebar groups.              |
| `mq`                                               | Responsive breakpoint used to show or hide header items. |
| `image`, `maxWidth`                                | Image-style footer or sponsor links.                     |

## Sidebar Menu Items

Sidebar menu items need a bit more care because they represent drawer sections instead of flat header links. Use the `sidebar` export in Site Config to control drawer navigation.

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

const processedMdPluginsMenu = {
  name: mdPluginsMenu.name,
  path: slugify(mdPluginsMenu.name),
  expanded: false,
  children: mdPluginsMenu.children.map(processMenuItem),
}
```

Now we have `processedMdPluginsMenu` which we can add to the `sidebar` array:

```ts
export const sidebar = [
  {
    name: gettingStartedMenu.name,
    path: slugify(gettingStartedMenu.name),
    expanded: false,
    children: gettingStartedMenu.children.map((item) => ({
      name: item.name,
      path: getSidebarPath(item),
    })),
  },
  processedMdPluginsMenu, // <-- this is the menu we just created
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
          children: [
            { name: 'Planner', path: '/examples/agenda/planner' },
            { name: 'Server Data', path: '/examples/agenda/server-data' },
          ],
        },
      ],
    },
  ],
} satisfies MenuItem
```

Reserve `path: ''` for sidebar-only grouping nodes. Real pages and header links should keep an explicit route path.

## More Links

The `moreLinks` array controls a menu item called `More`. Items here are displayed based on media query breakpoints and are removed from the normal header menu when they no longer fit. This is useful for smaller displays, tablets, and crowded navigation bars.

Use `mq` on the original header menu to decide when the item should move:

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

## Header, Sidebar, And Footer

| Region    | Configure with                                                              | Best for                                                           |
| --------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Header    | `links.primaryHeaderLinks`, `links.secondaryHeaderLinks`                    | High-priority sections and short route groups.                     |
| More menu | `links.moreLinks`                                                           | Header items that should collapse at smaller widths.               |
| Sidebar   | `sidebar`                                                                   | Full documentation outline and nested sections.                    |
| Footer    | `links.footerLinks`, `links.socialLinks`, `license`, `privacy`, `copyright` | Sponsor links, external references, legal links, and social links. |

## Announcements

Use `announcement` for calm site-wide notices such as releases, maintenance windows, upgrade warnings, or sponsor messages. Announcements are intentionally separate from privacy consent and marketing popups.

```ts [twoslash]
const announcement = {
  enabled: true,
  id: 'qpress-2026-06-release',
  message: 'Q-Press 0.1.0 includes improved SSG and themed docs components.',
  tone: 'info',
  startAt: '2026-06-01T00:00:00Z',
  endAt: '2026-06-30T23:59:59Z',
  dismissible: true,
  action: {
    label: 'Read release notes',
    link: '/other/releases',
  },
}
```

`id` is the versioned dismissal key. When a visitor dismisses the banner, Q-Press stores that id in `localStorage`. Change the id when you want dismissed visitors to see a new announcement. Use `startAt` and `endAt` when a normal docs announcement should only be visible during a planned window.

## Privacy Consent

Use `privacyConsent` only for privacy notices or consent prompts. This is separate from announcements because privacy consent can require accept, reject, customize, category-level preferences, policy links, expiration, and optional script or embed gating.

```ts [twoslash]
const privacyConsent = {
  enabled: true,
  id: 'privacy-consent-v1',
  mode: 'consent',
  title: 'Privacy preferences',
  message:
    'Choose whether this documentation site can enable optional analytics or third-party embeds.',
  policyLink: '/privacy-policy',
  expirationDays: 180,
  categories: [
    { id: 'necessary', label: 'Necessary', required: true },
    { id: 'analytics', label: 'Analytics' },
    { id: 'embeds', label: 'Third-party embeds' },
  ],
}
```

`expirationDays` starts when the visitor saves their choice. Q-Press stores both `savedAt` and a computed `expiresAt`, then asks again after the saved choice expires.

When a consent choice is read or saved, Q-Press dispatches a `qpress:privacy-consent` event on `window`. Site owners can listen for this event before loading optional analytics, marketing pixels, or third-party embeds:

```ts
window.addEventListener('qpress:privacy-consent', (event) => {
  const consent = event.detail

  if (consent.categories.analytics === true) {
    // Load optional analytics here.
  }
})
```

Q-Press keeps this feature static-host friendly, but it cannot provide legal advice. Site owners remain responsible for local privacy, cookie, and consent requirements.

## Campaigns

Use `campaigns` for intentionally restrained opt-in prompts such as sponsor messages, release campaigns, route-specific upgrade notices, or limited-time calls to action. Campaigns are separate from announcements and privacy consent so normal docs notices stay calm and consent behavior stays focused on privacy requirements.

```ts [twoslash]
const campaigns = [
  {
    enabled: true,
    id: 'sponsor-qpress-v1',
    title: 'Support Q-Press maintenance',
    message: 'If Q-Press is useful in your workflow, consider sponsoring ongoing maintenance.',
    tone: 'sponsor',
    startAt: '2026-06-01T00:00:00Z',
    endAt: '2026-06-30T23:59:59Z',
    includeRoutes: ['/quasar-app-extensions/qpress/*'],
    excludeRoutes: ['/privacy-policy'],
    trigger: { type: 'scroll-depth', scrollDepth: 65 },
    frequency: { strategy: 'days', days: 30, maxViews: 3 },
    device: 'desktop',
    mobileFallback: 'none',
    closeOnEsc: true,
    closeOnBackdrop: true,
    action: {
      label: 'Sponsor Jeff',
      link: 'https://github.com/sponsors/hawkeye64',
      external: true,
    },
  },
]
```

Campaign triggers currently support `load`, `delay`, `scroll-depth`, and desktop `exit-intent`. Route patterns support exact paths and simple trailing-wildcard prefixes such as `/guides/*`. Frequency defaults to `once`; use `session`, `days`, or `always` only when the message genuinely needs that behavior. Keep campaigns disabled by default and avoid mobile exit-intent patterns.

Use `device: 'desktop'`, `device: 'mobile'`, or `device: 'all'` to target a campaign to the right viewport class. `mobileFallback: 'load'` is only for cases where an `exit-intent` campaign is allowed on mobile but needs a touch-safe trigger instead.

## CodePen Links

`codepen` is used by `MarkdownExample` when a live example opens in CodePen. Add global packages when an example needs browser globals and use `cssExternal`, `jsExternal`, or `head` when examples need shared assets.

```ts [twoslash]
const codepen = {
  titleSuffix: ' - Q-Press Example',
  jsPreProcessor: 'typescript',
  globalPackages: [
    {
      packageName: 'quasar',
      globalName: 'Quasar',
    },
  ],
}
```

Keep CodePen setup in Site Config rather than hard-coding it into each example. That makes the examples portable across docs pages and easier to update when dependency versions change.
