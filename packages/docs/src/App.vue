<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { useDark } from 'src/.q-press/composables/dark'
import getMeta from 'src/.q-press/assets/get-meta'

const { initDark } = useDark()
initDark()

useMeta({
  title: 'MD-Plugins for Vue and Quasar',
  titleTemplate: (title) => `${title} | MD-Plugins`,

  meta: getMeta(
    'MD-Plugins - Build markdown user interfaces in record time',
    'MD-Plugins is a collection of Markdown and Vite plugins that make it easy to build markdown user interfaces in Vue and Quasar applications.',
  ),
})
</script>
