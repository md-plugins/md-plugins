/// <reference types="@quasar/app-vite/client" />

declare module '*.md'

declare global {
  interface TocMenuItem {
    id: string
    level: number
    title: string
    link?: string
    deep?: boolean
    sub?: boolean
    onClick?: () => void
    children?: TocMenuItem[]
  }

  interface MarkdownModule {
    title?: string
    headers?: TocMenuItem[]
    frontmatter?: Record<string, unknown>
    filename?: string
    render: (..._args: unknown[]) => unknown
  }

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
}

export {}
