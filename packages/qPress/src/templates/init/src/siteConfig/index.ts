import { fabGithub, fabXTwitter } from '@quasar/extras/fontawesome-v6'
import { slugify } from '@md-plugins/shared'
import { version } from 'src/../package.json'

export interface SocialLink {
  name: string
  icon: string
  path: string
  external?: boolean
}

export interface SiteMenuItem extends MenuItem {
  about?: string
  expanded?: boolean
  external?: boolean
  children?: SiteMenuItem[]
  separator?: boolean
  header?: string
  mq?: number
  extract?: string
  image?: string
  maxWidth?: string
}

export interface LinksConfig {
  primaryHeaderLinks: SiteMenuItem[]
  secondaryHeaderLinks: SiteMenuItem[]
  moreLinks: SiteMenuItem[]
  footerLinks: SiteMenuItem[]
  socialLinks: SocialLink[]
  ecoSystemLinks?: SiteMenuItem[]
}

export interface LogoConfig {
  showLogo: boolean
  logoLight: string
  logoDark: string
  logoAlt: string
}

export interface versionConfig {
  showTitle: boolean
  showVersion: boolean
  showOnHeader: boolean
  showOnSidebar: boolean
}

export interface UIConfig {
  usePrimaryHeader: boolean // typically 72px
  useSecondaryHeader: boolean // typically 55px
  headerHeightHint: number // typically 128 for both headers
  useMoreLinks: boolean
  useFooter: boolean
  useSidebar: boolean
  useToc: boolean
}

export interface CopyrightConfig {
  line1: string
  line2: string
}

export interface LicenseConfig {
  label: string
  link: string
}

export interface PrivacyConfig {
  label: string
  link: string
}

export interface SiteConfig {
  lang: string
  title: string
  description: string
  theme: string
  version: string
  copyright: CopyrightConfig
  githubEditRoot: string
  license: LicenseConfig
  privacy: PrivacyConfig
  logoConfig: LogoConfig
  versionConfig: versionConfig
  config: UIConfig
  links: LinksConfig
  sidebar: MenuItem[]
}

function processMenuItem(item: MenuItem): MenuItem {
  return {
    name: item.name,
    path: slugify(item.name),
    expanded: item.expanded ?? false,
    children: item.children ? item.children.map(processMenuItem) : undefined,
  }
}

const socialLinks = {
  name: 'Social',
  mq: 1400, // media query breakpoint
  children: [
    {
      name: 'GitHub',
      icon: fabGithub,
      path: 'https://github.com/md-plugins/md-plugins/tree/dev',
      external: true,
    },
    {
      name: 'X (Twitter)',
      icon: fabXTwitter,
      path: 'https://twitter.com/md_plugins',
      external: true,
    },
  ],
}

const netlifyLink = {
  path: 'https://www.netlify.com',
  external: true,
  image: 'https://www.netlify.com/img/global/badges/netlify-color-accent.svg',
  name: 'Deploys by Netlify',
  maxWidth: '120px',
}

const SponsorsLinks = {
  name: 'Sponsors',
  children: [
    {
      name: netlifyLink.name,
      path: netlifyLink.path,
      external: netlifyLink.external,
      image: netlifyLink.image,
    },
  ],
}

const footerLinks = [
  {
    name: SponsorsLinks.name,
    children: [...SponsorsLinks.children],
  },
  {
    name: socialLinks.name,
    children: [...socialLinks.children],
  },
]

const gettingStartedMenu = {
  name: 'Getting Started',
  mq: 470, // media query breakpoint
  children: [{ name: 'Introduction', path: '/getting-started/introduction' }],
}

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
    {
      name: 'Containers',
      children: [
        { name: 'Overview', path: '/md-plugins/containers/overview' },
        { name: 'Advanced', path: '/md-plugins/containers/advanced' },
      ],
    },
    {
      name: 'Frontmatter',
      children: [
        { name: 'Overview', path: '/md-plugins/frontmatter/overview' },
        { name: 'Advanced', path: '/md-plugins/frontmatter/advanced' },
      ],
    },
    {
      name: 'Headers',
      children: [
        { name: 'Overview', path: '/md-plugins/headers/overview' },
        { name: 'Advanced', path: '/md-plugins/headers/advanced' },
      ],
    },
    {
      name: 'Image',
      children: [
        { name: 'Overview', path: '/md-plugins/image/overview' },
        { name: 'Advanced', path: '/md-plugins/image/advanced' },
      ],
    },
    {
      name: 'Imports',
      children: [
        { name: 'Overview', path: '/md-plugins/imports/overview' },
        { name: 'Advanced', path: '/md-plugins/imports/advanced' },
      ],
    },
    {
      name: 'Inline Code',
      children: [
        { name: 'Overview', path: '/md-plugins/inlinecode/overview' },
        { name: 'Advanced', path: '/md-plugins/inlinecode/advanced' },
      ],
    },
    {
      name: 'Link',
      children: [
        { name: 'Overview', path: '/md-plugins/link/overview' },
        { name: 'Advanced', path: '/md-plugins/link/advanced' },
      ],
    },
    {
      name: 'Table',
      children: [
        { name: 'Overview', path: '/md-plugins/table/overview' },
        { name: 'Advanced', path: '/md-plugins/table/advanced' },
      ],
    },
    {
      name: 'Title',
      children: [
        { name: 'Overview', path: '/md-plugins/title/overview' },
        { name: 'Advanced', path: '/md-plugins/title/advanced' },
      ],
    },
    {
      name: 'Shared',
      children: [{ name: 'Overview', path: '/md-plugins/shared/overview' }],
    },
  ],
}

const vitePluginsMenu = {
  name: 'Vite Plugins',
  mq: 780, // media query breakpoint
  children: [
    {
      name: 'viteMdPlugin',
      children: [
        { name: 'Overview', path: '/vite-plugins/vitemdplugin/overview' },
        { name: 'Advanced', path: '/vite-plugins/vitemdplugin/advanced' },
      ],
    },
    {
      name: 'viteExamplesPlugin',
      children: [
        { name: 'Overview', path: '/vite-plugins/viteexamplesplugin/overview' },
        { name: 'Advanced', path: '/vite-plugins/viteexamplesplugin/advanced' },
      ],
    },
  ],
}

const QuasarAppExts = {
  name: 'Quasar App Extensions',
  mq: 1020, // media query breakpoint
  children: [
    {
      name: 'viteMdPluginAppExt',
      children: [
        { name: 'Overview', path: '/quasar-app-extensions/vitemdpluginappext/overview' },
        { name: 'Advanced', path: '/quasar-app-extensions/vitemdpluginappext/advanced' },
      ],
    },
    {
      name: 'QPress',
      children: [
        { name: 'Overview', path: '/quasar-app-extensions/qpress/overview' },
        { name: 'Advanced', path: '/quasar-app-extensions/qpress/advanced' },
      ],
    },
  ],
}

const guidesMenu = {
  name: 'Guides',
  mq: 1100, // media query breakpoint
  children: [
    {
      name: 'FAQ',
      path: '/guides/faq',
    },
    {
      name: 'Contributing',
      path: '/guides/contributing',
    },
  ],
}

const otherMenu = {
  name: 'Other',
  mq: 1190, // media query breakpoint
  children: [
    {
      name: 'Releases',
      path: '/other/release-notes',
    },
  ],
}

const processedMdPluginsMenu = {
  name: mdPluginsMenu.name,
  path: slugify(mdPluginsMenu.name),
  expanded: false,
  children: mdPluginsMenu.children.map(processMenuItem),
}

const processedVitePluginsMenu = {
  name: vitePluginsMenu.name,
  path: slugify(vitePluginsMenu.name),
  expanded: false,
  children: vitePluginsMenu.children.map(processMenuItem),
}

const processedQuasarAppExts = {
  name: QuasarAppExts.name,
  path: slugify(QuasarAppExts.name),
  expanded: false,
  children: QuasarAppExts.children.map(processMenuItem),
}

const processedGuidesMenu = {
  name: guidesMenu.name,
  path: slugify(guidesMenu.name),
  expanded: false,
  children: guidesMenu.children.map(processMenuItem),
}

const secondaryToolbarLinks = [
  gettingStartedMenu,
  mdPluginsMenu,
  vitePluginsMenu,
  QuasarAppExts,
  guidesMenu,
  otherMenu,
]

export const moreLinks = [
  {
    name: 'More',
    // children: [...primaryToolbarLinks, { separator: true }, ...secondaryToolbarLinks, socialLinks],
    children: [...secondaryToolbarLinks, socialLinks],
  },
]

export default {
  lang: 'en-US',
  title: '@md-plugins',
  description:
    'MD-Plugins is a collection of Markdown and Vite plugins that make it easy to build markdown user interfaces in Vue and Quasar applications.',
  theme: 'doc',
  version: version,
  copyright: {
    line1: `Copyright © 2020-${new Date().getFullYear()} MD-PLUGINS`,
    line2: '',
  } as CopyrightConfig,
  githubEditRoot: 'https://github.com/md-plugins/md-plugins/edit/dev/packages/docs/src/markdown/',
  license: {
    label: 'MIT License',
    link: 'https://github.com/md-plugins/md-plugins/blob/dev/LICENSE.md',
  } as LicenseConfig,
  privacy: {
    label: 'Privacy Policy',
    link: '/privacy-policy',
  } as PrivacyConfig,
  logoConfig: {
    showLogo: true,
    logoLight:
      'https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png',
    logoDark:
      'https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png',
    logoAlt: '@md-plugins',
  } as LogoConfig,
  versionConfig: {
    showTitle: true,
    showVersion: true,
    showOnHeader: false,
    showOnSidebar: true,
  } as versionConfig,
  config: {
    usePrimaryHeader: false,
    useSecondaryHeader: true,
    headerHeightHint: 55,
    useMoreLinks: true,
    useFooter: true,
    // useFooterLinks: true,
    useSidebar: true,
    useSidebarVersion: true,
    useToc: true,
  } as UIConfig,
  links: {
    primaryHeaderLinks: [] as SiteMenuItem[], // [...primaryToolbarLinks],
    secondaryHeaderLinks: [...secondaryToolbarLinks] as SiteMenuItem[],
    moreLinks: [
      {
        name: 'More',
        children: [
          // ...primaryToolbarLinks,
          // { separator: true },
          ...secondaryToolbarLinks,
          socialLinks,
        ],
      },
    ] as SiteMenuItem[],
    footerLinks: [...footerLinks] as SiteMenuItem[],
    socialLinks: [...socialLinks.children] as SocialLink[],
  },
  sidebar: [
    {
      name: gettingStartedMenu.name,
      path: slugify(gettingStartedMenu.name),
      expanded: false,
      children: gettingStartedMenu.children.map((item) => ({
        name: item.name,
        path: slugify(item.name),
      })),
    },
    processedMdPluginsMenu,
    processedVitePluginsMenu,
    processedQuasarAppExts,
    processedGuidesMenu,
  ],
} as SiteConfig
