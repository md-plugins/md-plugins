import { useQuasar } from 'quasar'
import { useMarkdownStore } from '../stores/markdown'
import { computed, watch } from 'vue'

export function useDark() {
  const $q = useQuasar()
  const markdownStore = useMarkdownStore()

  const isDark = computed(() => markdownStore.dark)

  function initDark() {
    markdownStore.dark = $q.cookies.get('theme') !== 'light'
  }

  function toggleDark() {
    const val = !markdownStore.dark
    markdownStore.dark = val

    $q.cookies.set('theme', val ? 'dark' : 'light', {
      path: '/',
      sameSite: 'Strict',
      expires: 400,
    })
  }

  watch(
    () => markdownStore.dark,
    (val) => {
      $q.dark.set(val)
    },
  )

  return {
    isDark,
    initDark,
    toggleDark,
  }
}
