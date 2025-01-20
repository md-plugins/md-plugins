import { fabGithub, fabXTwitter } from '@quasar/extras/fontawesome-v6'
import { slugify } from '@md-plugins/shared'
import { version, productName } from '../../package.json'

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
  githubEditRootSrc: string // src folder for github edit links (appended with 'markdown' and 'examples')
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

const gettingStartedMenu: SiteMenuItem = {
  name: 'Getting Started',
  mq: 470, // media query breakpoint
  children: [{ name: 'Introduction', path: '/getting-started/introduction' }],
}

const mdPluginsMenu: SiteMenuItem = {
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
        { name: 'Overview', path: '/md-plugins/inline-code/overview' },
        { name: 'Advanced', path: '/md-plugins/inline-code/advanced' },
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

const vitePluginsMenu: SiteMenuItem = {
  name: 'Vite Plugins',
  mq: 780, // media query breakpoint
  children: [
    {
      name: 'viteMdPlugin',
      children: [
        { name: 'Overview', path: '/vite-plugins/vite-md-plugin/overview' },
        { name: 'Advanced', path: '/vite-plugins/vite-md-plugin/advanced' },
      ],
    },
    {
      name: 'viteExamplesPlugin',
      children: [
        { name: 'Overview', path: '/vite-plugins/vite-examples-plugin/overview' },
        { name: 'Advanced', path: '/vite-plugins/vite-examples-plugin/advanced' },
      ],
    },
  ],
}

const QuasarAppExts: SiteMenuItem = {
  name: 'Quasar App Extensions',
  mq: 1020, // media query breakpoint
  children: [
    {
      name: 'viteMdPluginAppExt',
      children: [
        { name: 'Overview', path: '/quasar-app-extensions/vite-md-plugin-app-ext/overview' },
        { name: 'Advanced', path: '/quasar-app-extensions/vite-md-plugin-app-ext/advanced' },
      ],
    },
    {
      name: 'QPress',
      children: [
        { name: 'Overview', path: '/quasar-app-extensions/qpress/overview' },
        { name: 'Advanced', path: '/quasar-app-extensions/qpress/advanced' },
        { name: 'Themes', path: '/quasar-app-extensions/qpress/themes' },
        { name: 'Site Config', path: '/quasar-app-extensions/qpress/site-config' },
        { name: 'Components', path: '/quasar-app-extensions/qpress/components' },
      ],
    },
  ],
}

const guidesMenu: SiteMenuItem = {
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

const otherMenu: SiteMenuItem = {
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
  children: mdPluginsMenu.children ? mdPluginsMenu.children.map(processMenuItem) : [],
}

const processedVitePluginsMenu = {
  name: vitePluginsMenu.name,
  path: slugify(vitePluginsMenu.name),
  expanded: false,
  children: vitePluginsMenu.children ? vitePluginsMenu.children.map(processMenuItem) : [],
}

const processedQuasarAppExts = {
  name: QuasarAppExts.name,
  path: slugify(QuasarAppExts.name),
  expanded: false,
  children: QuasarAppExts.children ? QuasarAppExts.children.map(processMenuItem) : [],
}

const processedGuidesMenu = {
  name: guidesMenu.name,
  path: slugify(guidesMenu.name),
  expanded: false,
  children: guidesMenu.children ? guidesMenu.children.map(processMenuItem) : [],
}

const secondaryToolbarLinks = [
  gettingStartedMenu,
  mdPluginsMenu,
  vitePluginsMenu,
  QuasarAppExts,
  guidesMenu,
  otherMenu,
]

export const moreLinks: SiteMenuItem[] = [
  {
    name: 'More',
    // children: [...primaryToolbarLinks, { separator: true }, ...secondaryToolbarLinks, socialLinks],
    children: [...secondaryToolbarLinks, socialLinks],
  },
]

export const sidebar = [
  {
    name: gettingStartedMenu.name,
    path: slugify(gettingStartedMenu.name),
    expanded: false,
    children: gettingStartedMenu.children
      ? gettingStartedMenu.children.map((item) => ({
          name: item.name,
          path: slugify(item.name),
        }))
      : [],
  },
  processedMdPluginsMenu,
  processedVitePluginsMenu,
  processedQuasarAppExts,
  processedGuidesMenu,
]

const config = {
  lang: 'en-US',
  title: productName,
  description:
    'MD-Plugins is a collection of Markdown and Vite plugins that make it easy to build markdown user interfaces in Vue and Quasar applications.',
  theme: 'doc',
  version: version,
  copyright: {
    line1: `Copyright © 2024-${new Date().getFullYear()} MD-PLUGINS`,
    line2: '',
  } as CopyrightConfig,
  githubEditRootSrc: 'https://github.com/md-plugins/md-plugins/edit/dev/packages/docs/src/',
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
    moreLinks,
    footerLinks: [...footerLinks] as SiteMenuItem[],
    socialLinks: [...socialLinks.children] as SocialLink[],
  },
  sidebar,
} as SiteConfig

export { sidebar as menu }
export default config
