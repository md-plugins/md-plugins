import type { HtmlTagDescriptor, Plugin } from 'vite'

export const montserratNormalFontUrl =
  'https://cdn.quasar.dev/fonts/montserrat/v25-fix-2/montserrat-latin-variable-wghtOnly-normal.woff2'

export function getQPressFontPreloadTags(): HtmlTagDescriptor[] {
  return [
    {
      tag: 'link',
      attrs: {
        rel: 'preconnect',
        href: 'https://cdn.quasar.dev',
        crossorigin: '',
      },
      injectTo: 'head-prepend',
    },
    {
      tag: 'link',
      attrs: {
        rel: 'preload',
        href: montserratNormalFontUrl,
        as: 'font',
        type: 'font/woff2',
        crossorigin: '',
      },
      injectTo: 'head-prepend',
    },
  ]
}

export const qPressFontPreloadPlugin: Plugin = {
  name: 'qpress:font-preload',
  transformIndexHtml: {
    order: 'pre',
    handler: getQPressFontPreloadTags,
  },
}
