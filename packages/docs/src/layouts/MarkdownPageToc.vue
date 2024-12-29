<template>
  <q-list class="markdown-page__toc">
    <q-item
      v-for="tocItem in docStore.toc"
      :key="tocItem.id"
      :id="`toc--${tocItem.id}`"
      clickable
      class="markdown-layout__item"
      active-class="markdown-layout__item--active"
      v-ripple
      :active="docStore.activeToc === tocItem.id"
      @click="tocItem.onClick"
    >
      <q-item-section v-if="tocItem.sub === true" side />
      <q-item-section>{{ tocItem.title }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useDocStore } from 'stores/doc'
const docStore = useDocStore()
</script>
