import type { RouteRecordRaw } from 'vue-router'
import mdPageList from 'src/pages/listing'

const routeMap = {
  // './docs/docs.md': { path: 'docs' },
  // './integrations/integrations.md': { path: 'integrations' },
  './components/components.md': {
    path: 'components',
    meta: { fullwidth: true, dark: true },
  },
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MarkdownLayout.vue'),
    children: [
      // Include the Landing Page route first
      ...Object.entries(mdPageList)
        .filter(([key]) => key.includes('landing-page.md'))
        .map(
          ([_key, component]) =>
            ({
              path: '',
              name: 'Landing Page',
              component,
              meta: { fullscreen: true, dark: true },
            }) as RouteRecordRaw,
        ),

      // Now include all other routes, excluding the landing-page
      ...Object.keys(mdPageList)
        .filter((key) => !key.includes('landing-page.md')) // Exclude duplicates
        .map((key) => {
          // @ts-expect-error Jeff - fix later
          const acc: RouteRecordRaw = {
            path: '',
            component: mdPageList[key],
          }

          const route = routeMap[key as keyof typeof routeMap]
          if (route !== undefined) {
            Object.assign(acc, route)
          }

          if (acc.path === '') {
            // Remove '.md' from the end of the filename
            const parts = key.substring(1, key.length - 3).split('/')
            const len = parts.length
            const path = parts[len - 2] === parts[len - 1] ? parts.slice(0, len - 1) : parts

            acc.path = path.join('/')
          }

          return acc
        }),
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
