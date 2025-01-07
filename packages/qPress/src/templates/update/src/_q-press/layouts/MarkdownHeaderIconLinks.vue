<template>
  <div class="markdown-header-icon-links row no-wrap items-center">
    <q-btn
      v-for="(entry, index) in props.menu"
      :key="index"
      class="header-btn"
      flat
      round
      :icon="entry.icon"
      :to="entry.path"
      :href="entry.external ? entry.path : void 0"
      :target="entry.external ? '_blank' : void 0"
      :aria-label="entry.name"
    />
  </div>
</template>

<script setup lang="ts">
interface MenuEntry {
  icon: string
  path: string
  external?: boolean
  name: string
}

const props = defineProps<{
  menu: MenuEntry[]
}>()

console.log('props.menu:', props.menu)
</script>
