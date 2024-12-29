import { useQuasar } from 'quasar'
import { useDocStore } from '../stores/doc'
import { computed, watch } from 'vue'

export function useDark() {
  const $q = useQuasar()
  const docStore = useDocStore()

  const isDark = computed(() => docStore.dark)

  function initDark() {
    docStore.dark = $q.cookies.get('theme') !== 'light'
  }

  function toggleDark() {
    const val = !docStore.dark
    docStore.dark = val

    $q.cookies.set('theme', val ? 'dark' : 'light', {
      path: '/',
      sameSite: 'Strict',
      expires: 400,
    })
  }

  watch(
    () => docStore.dark,
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
