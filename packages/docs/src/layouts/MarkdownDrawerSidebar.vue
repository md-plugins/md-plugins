<template>
  <q-drawer
    id="menu-drawer"
    v-model="docStore.menuDrawer"
    class="markdown-drawer"
    behavior="mobile"
    :width="330"
    aria-label="Sidebar Navigation"
    role="navigation"
  >
    <div class="markdown-drawer__header row justify-end no-wrap q-pt-sm q-pb-md q-px-xs">
      <q-btn
        :icon="mdiClose"
        round
        dense
        flat
        color="brand-accent"
        @click="docStore.toggleMenuDrawer"
      />
    </div>
    <MarkdownPageSidebar class="q-mx-xs q-mb-lg" />
  </q-drawer>
</template>

<script setup lang="ts">
import { mdiClose } from '@quasar/extras/mdi-v7'

import { useDocStore } from 'stores/doc'
import MarkdownPageSidebar from './MarkdownPageSidebar'

const docStore = useDocStore()
</script>
