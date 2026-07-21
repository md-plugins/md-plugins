import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const vueHooks = vi.hoisted(() => ({
  mounted: [] as Array<() => void>,
  beforeUnmount: [] as Array<() => void>,
}))

const scrollMocks = vi.hoisted(() => ({
  getVerticalScrollPosition: vi.fn(),
  setVerticalScrollPosition: vi.fn(),
}))

const route = vi.hoisted(() => ({
  fullPath: '/examples#example-target',
  hash: '#example-target',
}))

vi.mock('vue', () => ({
  onBeforeUnmount: (callback: () => void) => vueHooks.beforeUnmount.push(callback),
  onMounted: (callback: () => void) => vueHooks.mounted.push(callback),
  watch: vi.fn(),
}))

vi.mock('quasar', () => ({
  scroll: scrollMocks,
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ replace: vi.fn(() => Promise.resolve()) }),
}))

vi.mock('../src/templates/init/src/_q-press/stores/markdown', () => ({
  useMarkdownStore: () => ({ setActiveToc: vi.fn() }),
}))

import { useScroll } from '../src/templates/init/src/_q-press/composables/scroll'

describe('Q-Press anchor scrolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vueHooks.mounted.length = 0
    vueHooks.beforeUnmount.length = 0
    scrollMocks.getVerticalScrollPosition.mockReset()
    scrollMocks.setVerticalScrollPosition.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('keeps a hash target aligned while examples above it expand', () => {
    let documentTop = 1_200
    let scrollTop = 0
    let resizeCallback: (() => void) | undefined

    const animationFrames = new Map<number, FrameRequestCallback>()
    let nextAnimationFrame = 1

    const bodyClasses = new Set<string>()
    const page = {
      classList: {
        contains: (name: string) => name === 'q-page',
      },
      parentElement: null,
    }
    const content = {
      classList: {
        add: vi.fn(),
        contains: vi.fn(() => false),
        remove: vi.fn(),
      },
      parentElement: page,
    }
    const target = {
      closest: (selector: string) =>
        selector === '.markdown-page__content' || selector === '.q-page' ? content : null,
      getBoundingClientRect: () => ({ top: documentTop - scrollTop }),
      isConnected: true,
      parentElement: content,
    }

    const windowMock = {
      addEventListener: vi.fn(),
      cancelAnimationFrame: (id: number) => animationFrames.delete(id),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        const id = nextAnimationFrame++
        animationFrames.set(id, callback)
        return id
      },
    }

    class ResizeObserverMock {
      disconnect = vi.fn()
      observe = vi.fn()

      constructor(callback: () => void) {
        resizeCallback = callback
      }
    }

    vi.stubGlobal('window', windowMock)
    vi.stubGlobal('location', { hash: '#example-target' })
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    vi.stubGlobal('document', {
      body: {
        classList: {
          add: (name: string) => bodyClasses.add(name),
          remove: (name: string) => bodyClasses.delete(name),
        },
      },
      documentElement: {},
      getElementById: (id: string) => (id === 'example-target' ? target : null),
    })

    scrollMocks.getVerticalScrollPosition.mockImplementation(() => scrollTop)
    scrollMocks.setVerticalScrollPosition.mockImplementation((_target, position) => {
      scrollTop = position
    })

    useScroll()
    expect(vueHooks.mounted).toHaveLength(1)

    vueHooks.mounted[0]!()
    vi.advanceTimersByTime(0)

    for (const [id, callback] of animationFrames) {
      animationFrames.delete(id)
      callback(0)
    }

    expect(target.getBoundingClientRect().top).toBe(166)

    documentTop += 640
    resizeCallback?.()

    for (const [id, callback] of animationFrames) {
      animationFrames.delete(id)
      callback(0)
    }

    expect(target.getBoundingClientRect().top).toBe(166)
    expect(scrollMocks.setVerticalScrollPosition).toHaveBeenLastCalledWith(windowMock, 1_674, 0)
  })
})
