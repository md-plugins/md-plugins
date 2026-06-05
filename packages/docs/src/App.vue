<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { useDark } from '@/.q-press/composables/dark'
import getMeta from '@/.q-press/assets/get-meta'

const { initDark } = useDark()
initDark()

useMeta({
  title: 'MD-Plugins for Vite, Vue, and Quasar',
  titleTemplate: (title) => `${title} | MD-Plugins`,

  meta: getMeta(
    'MD-Plugins - Markdown tooling for Vite, Vue, and Quasar',
    'MD-Plugins provides Markdown-it plugins, Vite plugins, and Quasar app extensions for Vue/Vite content workflows, Q-Press docs sites, and SSG-ready documentation.',
  ),
})
</script>
