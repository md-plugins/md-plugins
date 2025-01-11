---
title: Q-Press Site Config
desc: Site Config for Q-Press App-Extension for Quasar.
---

The Site Config lives in your `src/siteConfig/index.ts`. Here you can make changes to control the look and feel of your site.

## Basic Config

Look at the Site Config file and make any appropriate changes. This is where you can add a `title`, `description`, `logo` information, `license`, `privacy` and more.

Use the `config` section to control how your site will look. Then, move onto the `links` section to create your header menus and the `sideBar` section to create your sidebar menus.

## Menu System

For each markdown file in your `src/markdown` folder, the Vue Router will automatically generate a path for it. When creating menus, you will use the same path as the markdown file.

Menus that you create can also be displayed in the `sideBar` or `header`, or both, of your site.

To create a top-level menu, create something similar to the following:

```ts
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

Chose the toolbar and order you want the menu displayed on like this:

```ts
const secondaryToolbarLinks = [
  gettingStartedMenu,
  mdPluginsMenu, // <-- this is the menu we just created
  vitePluginsMenu,
  QuasarAppExts,
  guidesMenu,
  otherMenu,
]
```

## MenuItem Type

A `MenuItem` looks like this, but not all options are used for header menus:

```ts
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

## Sidebar Menu Items

Sidebar menu items need a bit more care. You can use the `sideBar` property in the Site Config to where the menu is displayed. But, we need to process it a bit:

```ts
const processedMdPluginsMenu = {
  name: mdPluginsMenu.name,
  path: slugify(mdPluginsMenu.name),
  expanded: false,
  children: mdPluginsMenu.children.map(processMenuItem),
}
```

Now we have `processedMdPluginsMenu` which we can add to the `sideBar` array:

```ts
export const sidebar = [
  {
    name: gettingStartedMenu.name,
    path: slugify(gettingStartedMenu.name),
    expanded: false,
    children: gettingStartedMenu.children.map((item) => ({
      name: item.name,
      path: slugify(item.name),
    })),
  },
  processedMdPluginsMenu, // <-- this is the menu we just created
  processedVitePluginsMenu,
  processedQuasarAppExts,
  processedGuidesMenu,
]
```

## More Links

The `moreLinks` controls a menu item called `More`. Items here are automatically displayed base on your media query breakpoints, and also removed from the header menu. This is useful for smaller displays, like mobile devices.
