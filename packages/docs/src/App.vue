<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { useDark } from './composables/dark'
import getMeta from 'assets/get-meta.js'
const { initDark } = useDark()
initDark()

useMeta({
  title: 'MD-Plugins for Vue and Quasar',
  titleTemplate: (title) => `${title} | MD-Plugins`,

  meta: getMeta(
    'MD-Plugins - Build markdown user interfaces in record time',
    'MD-Plugins is a collection of Markdown and Vite plugins that make it easy to build markdown user interfaces in Vue and Quasar applications.',
  )
})
</script>
