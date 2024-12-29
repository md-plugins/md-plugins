<template>
  <router-view />
</template>

<script setup lang="ts">
import { useDark } from './composables/dark'
const { initDark } = useDark()
initDark()
</script>
