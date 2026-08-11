/// <reference lib="dom" />

import { createJsonSearchProvider } from './providers'
import { createSearchTerms } from './text'
import type { SearchProvider, SearchResult } from './types'

const templateStyles = /* css */ `
  :host {
    color-scheme: var(--md-search-color-scheme, light);
    --md-search-z-index: 5000;
    --md-search-font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --md-search-trigger-bg: color-mix(in srgb, var(--md-search-accent, #2d7ff9) 10%, transparent);
    --md-search-trigger-border: color-mix(in srgb, var(--md-search-accent, #2d7ff9) 34%, transparent);
    --md-search-trigger-color: var(--md-search-text, #172033);
    --md-search-backdrop: rgb(8 13 24 / 54%);
    --md-search-surface: #ffffff;
    --md-search-surface-raised: #f6f8fb;
    --md-search-text: #172033;
    --md-search-muted: #64748b;
    --md-search-border: #d7deea;
    --md-search-accent: #2d7ff9;
    --md-search-highlight: #f97316;
    --md-search-highlight-bg: color-mix(in srgb, var(--md-search-highlight) 14%, transparent);
    --md-search-result-bg: var(--md-search-surface-raised);
    --md-search-result-active-bg: color-mix(in srgb, var(--md-search-accent) 12%, var(--md-search-surface));
    --md-search-result-active-border: color-mix(in srgb, var(--md-search-accent) 74%, var(--md-search-border));
    --md-search-pill-bg: color-mix(in srgb, var(--md-search-accent) 9%, transparent);
    --md-search-pill-border: color-mix(in srgb, var(--md-search-accent) 54%, transparent);
    --md-search-radius: 16px;
    --md-search-shadow: 0 24px 80px rgb(15 23 42 / 28%);
    --md-search-width: min(720px, calc(100vw - 28px));
    --md-search-mobile-trigger-size: 40px;
    display: inline-flex;
    font-family: var(--md-search-font-family);
  }

  :host([theme="dark"]) {
    --md-search-color-scheme: dark;
    --md-search-trigger-bg: color-mix(in srgb, var(--md-search-accent, #72a7ff) 16%, transparent);
    --md-search-trigger-border: color-mix(in srgb, var(--md-search-accent, #72a7ff) 42%, transparent);
    --md-search-trigger-color: var(--md-search-text, #eef5ff);
    --md-search-backdrop: rgb(0 0 0 / 66%);
    --md-search-surface: #111827;
    --md-search-surface-raised: #1f2937;
    --md-search-text: #eef5ff;
    --md-search-muted: #a7b4c8;
    --md-search-border: #334155;
    --md-search-accent: #72a7ff;
    --md-search-highlight: #ff8a3d;
    --md-search-highlight-bg: color-mix(in srgb, var(--md-search-highlight) 18%, transparent);
    --md-search-result-bg: #0b1220;
    --md-search-result-active-bg: color-mix(in srgb, var(--md-search-highlight) 16%, #1b1020);
    --md-search-result-active-border: var(--md-search-highlight);
    --md-search-pill-bg: color-mix(in srgb, var(--md-search-accent) 12%, transparent);
    --md-search-pill-border: color-mix(in srgb, var(--md-search-accent) 74%, transparent);
    --md-search-shadow: 0 24px 90px rgb(0 0 0 / 48%);
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([theme="light"])) {
      --md-search-color-scheme: dark;
      --md-search-trigger-bg: color-mix(in srgb, var(--md-search-accent, #72a7ff) 16%, transparent);
      --md-search-trigger-border: color-mix(in srgb, var(--md-search-accent, #72a7ff) 42%, transparent);
      --md-search-trigger-color: var(--md-search-text, #eef5ff);
      --md-search-backdrop: rgb(0 0 0 / 66%);
      --md-search-surface: #111827;
      --md-search-surface-raised: #1f2937;
      --md-search-text: #eef5ff;
      --md-search-muted: #a7b4c8;
      --md-search-border: #334155;
      --md-search-accent: #72a7ff;
      --md-search-highlight: #ff8a3d;
      --md-search-highlight-bg: color-mix(in srgb, var(--md-search-highlight) 18%, transparent);
      --md-search-result-bg: #0b1220;
      --md-search-result-active-bg: color-mix(in srgb, var(--md-search-highlight) 16%, #1b1020);
      --md-search-result-active-border: var(--md-search-highlight);
      --md-search-pill-bg: color-mix(in srgb, var(--md-search-accent) 12%, transparent);
      --md-search-pill-border: color-mix(in srgb, var(--md-search-accent) 74%, transparent);
      --md-search-shadow: 0 24px 90px rgb(0 0 0 / 48%);
    }
  }

  * {
    box-sizing: border-box;
  }

  button,
  input {
    font: inherit;
  }

  [hidden] {
    display: none !important;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
    max-width: 100%;
    padding: 0 12px;
    border: 1px solid var(--md-search-trigger-border);
    border-radius: 999px;
    background: var(--md-search-trigger-bg);
    color: var(--md-search-trigger-color);
    cursor: pointer;
  }

  .trigger:hover {
    border-color: var(--md-search-accent);
  }

  .trigger__icon {
    font-size: 18px;
    line-height: 1;
  }

  .kbd {
    display: inline-flex;
    min-width: 34px;
    justify-content: center;
    padding: 3px 6px;
    border: 1px solid var(--md-search-border);
    border-radius: 7px;
    color: var(--md-search-muted);
    font-size: 0.72rem;
    line-height: 1;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--md-search-z-index);
    display: grid;
    align-items: start;
    justify-items: center;
    padding: min(10vh, 76px) 14px 24px;
    background: var(--md-search-backdrop);
  }

  .dialog {
    width: var(--md-search-width);
    overflow: hidden;
    border: 1px solid var(--md-search-border);
    border-radius: var(--md-search-radius);
    background: var(--md-search-surface);
    color: var(--md-search-text);
    box-shadow: var(--md-search-shadow);
  }

  .header {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--md-search-border);
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .title {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .close {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--md-search-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--md-search-surface-raised);
    color: var(--md-search-text);
  }

  .input {
    width: 100%;
    min-height: 48px;
    border: 1px solid var(--md-search-border);
    border-radius: calc(var(--md-search-radius) - 6px);
    background: var(--md-search-surface-raised);
    color: var(--md-search-text);
    outline: 0;
    padding: 0 14px;
    font-size: 1rem;
  }

  .input:focus {
    border-color: var(--md-search-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-search-accent) 18%, transparent);
  }

  .help {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    color: var(--md-search-muted);
    font-size: 0.82rem;
  }

  .help__item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .help .kbd {
    min-width: 26px;
    padding: 4px 6px;
    border-color: color-mix(in srgb, var(--md-search-highlight) 36%, var(--md-search-border));
    background: color-mix(in srgb, var(--md-search-highlight) 16%, transparent);
    color: var(--md-search-text);
  }

  .status {
    padding: 28px 18px;
    color: var(--md-search-muted);
    text-align: center;
  }

  .list {
    max-height: min(58vh, 560px);
    overflow: auto;
    overscroll-behavior: contain;
    padding: 10px;
  }

  .result {
    display: block;
    width: 100%;
    border: 1px solid var(--md-search-border);
    border-radius: calc(var(--md-search-radius) - 6px);
    background: var(--md-search-result-bg);
    color: inherit;
    cursor: pointer;
    padding: 12px 14px;
    text-align: left;
  }

  .result + .result {
    margin-top: 8px;
  }

  .result:hover,
  .result--active {
    border-color: var(--md-search-result-active-border);
    background: var(--md-search-result-active-bg);
  }

  .result__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .result__trail {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 4px 7px;
    border: 1px solid var(--md-search-pill-border);
    border-radius: 6px;
    background: var(--md-search-pill-bg);
    color: var(--md-search-accent);
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1.15;
  }

  .result__separator {
    color: var(--md-search-muted);
    font-weight: 700;
  }

  .result__type {
    flex: 0 0 auto;
    color: var(--md-search-accent);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .result__content {
    margin-top: 10px;
    color: var(--md-search-text);
    font-size: 0.94rem;
    line-height: 1.45;
  }

  .result__path {
    margin-top: 6px;
    color: var(--md-search-muted);
    font-size: 0.76rem;
    line-height: 1.35;
  }

  mark {
    border-radius: 4px;
    background: var(--md-search-highlight-bg);
    color: var(--md-search-highlight);
    font-weight: 900;
    padding: 0 1px;
  }

  @media (max-width: 560px) {
    .trigger__label {
      display: none;
    }

    .trigger {
      width: var(--md-search-mobile-trigger-size);
      min-height: var(--md-search-mobile-trigger-size);
      justify-content: center;
      padding: 0;
    }

    .kbd {
      display: none;
    }

    .help {
      display: none;
    }
  }
`

const icon = '⌕'

function getShortcutLabel(shortcut: string): string {
  if (shortcut === 'none') {
    return ''
  }

  if (shortcut === 'mod+k') {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(globalThis.navigator?.platform ?? '')
    return isMac ? '⌘K' : 'Ctrl K'
  }

  return shortcut
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderHighlightedText(value: unknown, terms: string[]): string {
  const text = String(value ?? '')

  if (text === '' || terms.length === 0) {
    return escapeHtml(text)
  }

  const pattern = new RegExp(
    terms
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|'),
    'gi',
  )
  let output = ''
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0

    output += escapeHtml(text.slice(lastIndex, index))
    output += `<mark>${escapeHtml(match[0])}</mark>`
    lastIndex = index + match[0].length
  }

  output += escapeHtml(text.slice(lastIndex))

  return output
}

function formatResultType(type: SearchResult['type']): string {
  if (type === 'page') {
    return 'page'
  }

  if (type === 'heading') {
    return 'heading'
  }

  return 'content'
}

function getResultTrail(result: SearchResult): string[] {
  const trail = (result.hierarchy.length > 0 ? result.hierarchy : [result.title]).filter(
    (entry, index, entries) => entry !== '' && entry !== entries[index - 1],
  )

  if (result.section !== undefined && !trail.includes(result.section)) {
    return [...trail, result.section]
  }

  return trail
}

function renderResultTrail(result: SearchResult, terms: string[]): string {
  return getResultTrail(result)
    .filter(Boolean)
    .map((entry) => `<span>${renderHighlightedText(entry, terms)}</span>`)
    .join('<span class="result__separator" aria-hidden="true">&rsaquo;</span>')
}

const BrowserHTMLElement = (globalThis as typeof globalThis & { HTMLElement?: typeof HTMLElement })
  .HTMLElement
const HTMLElementBase =
  BrowserHTMLElement ?? (class MdSearchServerElement {} as unknown as typeof HTMLElement)

export class MdSearchElement extends HTMLElementBase {
  static observedAttributes = [
    'src',
    'placeholder',
    'trigger-label',
    'panel-title',
    'shortcut',
    'theme',
    'search-label',
    'min-query-length',
    'max-results',
    'show-duplicate-results',
  ]

  provider?: SearchProvider

  private readonly root = this.attachShadow({ mode: 'open' })
  private readonly elementId = `md-search-${Math.random().toString(36).slice(2)}`
  private results: SearchResult[] = []
  private query = ''
  private opened = false
  private loading = false
  private errorMessage = ''
  private activeIndex = 0
  private searchTimer: ReturnType<typeof setTimeout> | undefined
  private searchRequestId = 0
  private selectionStart: number | null = null
  private selectionEnd: number | null = null
  private previouslyFocusedElement: HTMLElement | null = null

  connectedCallback(): void {
    this.render()
    globalThis.addEventListener?.('keydown', this.onGlobalKeydown)
  }

  disconnectedCallback(): void {
    globalThis.removeEventListener?.('keydown', this.onGlobalKeydown)
    clearTimeout(this.searchTimer)
  }

  attributeChangedCallback(name: string): void {
    if (name === 'src') {
      this.provider = undefined
    }

    if (name === 'show-duplicate-results' && this.query.trim().length >= this.minQueryLength) {
      void this.runSearch()
      return
    }

    this.render()
  }

  open(): void {
    this.previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    this.opened = true
    this.render()
    this.focusInput()
  }

  close(): void {
    this.opened = false
    this.render()
    const focusTarget =
      this.previouslyFocusedElement ?? this.root.querySelector<HTMLElement>('[part="trigger"]')
    focusTarget?.focus()
    this.previouslyFocusedElement = null
  }

  toggle(): void {
    if (this.opened) {
      this.close()
    } else {
      this.open()
    }
  }

  private get src(): string | undefined {
    return this.getAttribute('src') ?? undefined
  }

  private get placeholder(): string {
    return this.getAttribute('placeholder') ?? 'Search docs...'
  }

  private get triggerLabel(): string {
    return this.getAttribute('trigger-label') ?? 'Search'
  }

  private get panelTitle(): string {
    return this.getAttribute('panel-title') ?? 'Search'
  }

  private get searchLabel(): string {
    return this.getAttribute('search-label') ?? this.panelTitle
  }

  private get shortcut(): string {
    return this.getAttribute('shortcut') ?? 'mod+k'
  }

  private get minQueryLength(): number {
    return Number(this.getAttribute('min-query-length') ?? 2)
  }

  private get maxResults(): number {
    return Number(this.getAttribute('max-results') ?? 12)
  }

  private get showDuplicateResults(): boolean {
    return this.hasAttribute('show-duplicate-results')
  }

  private get activeResult(): SearchResult | undefined {
    return this.results[this.activeIndex]
  }

  private getProvider(): SearchProvider {
    this.provider ??= createJsonSearchProvider({ src: this.src })
    return this.provider
  }

  private readonly onGlobalKeydown = (event: KeyboardEvent): void => {
    if (this.shortcut !== 'mod+k') {
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
      event.preventDefault()
      this.open()
    }
  }

  private readonly onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement

    this.query = input.value
    this.selectionStart = input.selectionStart
    this.selectionEnd = input.selectionEnd
    this.searchRequestId++
    clearTimeout(this.searchTimer)

    if (this.query.trim().length < this.minQueryLength) {
      this.results = []
      this.loading = false
      this.errorMessage = ''
      this.activeIndex = 0
      this.renderResultsContainer()
      return
    }

    this.loading = true
    this.errorMessage = ''
    this.renderResultsContainer()

    this.searchTimer = setTimeout(() => {
      void this.runSearch()
    }, 120)
  }

  private readonly onDialogKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      this.close()
      return
    }

    if (event.key === 'Tab') {
      const focusableElements = Array.from(
        this.root.querySelectorAll<HTMLElement>(
          '[part="dialog"] button:not([disabled]), [part="dialog"] input:not([disabled])',
        ),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (firstElement !== undefined && lastElement !== undefined) {
        if (event.shiftKey && this.root.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (event.shiftKey === false && this.root.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }

      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.setActiveIndex(this.activeIndex + 1, {
        scrollIntoView: true,
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      this.setActiveIndex(this.activeIndex - 1, {
        scrollIntoView: true,
      })
      return
    }

    if (event.key === 'Enter' && this.activeResult !== undefined) {
      event.preventDefault()
      this.selectResult(this.activeResult)
    }
  }

  private async runSearch(): Promise<void> {
    const requestId = ++this.searchRequestId

    try {
      const results = await this.getProvider().search(this.query, {
        limit: this.maxResults,
        collapseDuplicateResults: !this.showDuplicateResults,
      })

      if (requestId !== this.searchRequestId) {
        return
      }

      this.results = results
      this.loading = false
      this.errorMessage = ''
      this.activeIndex = 0
    } catch (error) {
      if (requestId !== this.searchRequestId) {
        return
      }

      this.results = []
      this.loading = false
      this.errorMessage = error instanceof Error ? error.message : 'Search failed.'
    }

    this.renderResultsContainer()
  }

  private focusInput(options: { restoreSelection?: boolean } = {}): void {
    const { selectionStart, selectionEnd } = this

    requestAnimationFrame(() => {
      const input = this.root.querySelector<HTMLInputElement>('[part="input"]')

      input?.focus()

      if (
        input !== null &&
        options.restoreSelection === true &&
        selectionStart !== null &&
        selectionEnd !== null
      ) {
        input.setSelectionRange(selectionStart, selectionEnd)
      }
    })
  }

  private setActiveIndex(index: number, options: { scrollIntoView?: boolean } = {}): void {
    if (this.results.length === 0) {
      return
    }

    this.activeIndex = Math.min(Math.max(index, 0), this.results.length - 1)
    this.syncActiveResult(options)
  }

  private syncInputAria(): void {
    const input = this.root.querySelector<HTMLInputElement>('[part="input"]')

    if (input === null) {
      return
    }

    input.setAttribute('aria-expanded', this.results.length > 0 ? 'true' : 'false')

    if (this.results.length === 0) {
      input.removeAttribute('aria-activedescendant')
      input.removeAttribute('aria-controls')
      return
    }

    input.setAttribute('aria-controls', `${this.elementId}-listbox`)
    input.setAttribute('aria-activedescendant', `${this.elementId}-result-${this.activeIndex}`)
  }

  private syncActiveResult(options: { scrollIntoView?: boolean } = {}): void {
    this.syncInputAria()

    this.root.querySelectorAll<HTMLElement>('[data-result-index]').forEach((element) => {
      const isActive = Number(element.dataset.resultIndex ?? -1) === this.activeIndex

      element.classList.toggle('result--active', isActive)
      element.setAttribute('aria-selected', isActive ? 'true' : 'false')

      if (isActive && options.scrollIntoView === true) {
        element.scrollIntoView({
          block: 'nearest',
        })
      }
    })
  }

  private selectResult(result: SearchResult): void {
    const event = new CustomEvent('md-search-select', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { result },
    })

    const shouldNavigate = this.dispatchEvent(event)
    this.close()

    if (shouldNavigate) {
      globalThis.location.assign(result.url)
    }
  }

  private bindResultEvents(): void {
    this.root.querySelectorAll<HTMLElement>('[data-result-index]').forEach((element) => {
      element.addEventListener('mouseenter', () => {
        this.setActiveIndex(Number(element.dataset.resultIndex ?? 0))
      })
      element.addEventListener('click', () => {
        const result = this.results[Number(element.dataset.resultIndex ?? 0)]
        if (result !== undefined) {
          this.selectResult(result)
        }
      })
    })
  }

  private renderResultsContainer(): void {
    const container = this.root.querySelector<HTMLElement>('[part="results"]')

    if (container === null) {
      this.render()
      return
    }

    container.innerHTML = this.renderResults()
    this.bindResultEvents()
    this.syncInputAria()
  }

  private renderResults(): string {
    if (this.loading) {
      return '<div part="status" class="status" role="status" aria-live="polite">Searching...</div>'
    }

    if (this.errorMessage !== '') {
      return `<div part="status" class="status" role="status" aria-live="assertive">${escapeHtml(this.errorMessage)}</div>`
    }

    if (this.query.trim().length < this.minQueryLength) {
      return `<div part="status" class="status" role="status" aria-live="polite">Type at least ${this.minQueryLength} characters.</div>`
    }

    if (this.results.length === 0) {
      return '<div part="status" class="status" role="status" aria-live="polite">No results found.</div>'
    }

    const terms = createSearchTerms(this.query)

    return `
      <div part="list" class="list" id="${this.elementId}-listbox" role="listbox">
        ${this.results
          .map((result, index) => {
            const resultId = `${this.elementId}-result-${index}`

            return `
              <button
                id="${resultId}"
                type="button"
                part="result"
                class="result ${index === this.activeIndex ? 'result--active' : ''}"
                data-result-index="${index}"
                role="option"
                tabindex="-1"
                aria-selected="${index === this.activeIndex ? 'true' : 'false'}"
              >
                <div part="result-title" class="result__header">
                  <span part="result-trail" class="result__trail">${renderResultTrail(result, terms)}</span>
                  <span part="result-type" class="result__type">${escapeHtml(formatResultType(result.type))}</span>
                </div>
                <div part="result-snippet" class="result__content">${renderHighlightedText(result.content, terms)}</div>
                <div part="result-url" class="result__path">${escapeHtml(result.url)}</div>
              </button>
            `
          })
          .join('')}
      </div>
    `
  }

  private render(): void {
    const shortcutLabel = getShortcutLabel(this.shortcut)
    const dialogId = `${this.elementId}-dialog`
    const titleId = `${this.elementId}-title`
    const activeResultId =
      this.results.length > 0 ? `${this.elementId}-result-${this.activeIndex}` : undefined

    this.root.innerHTML = `
      <style>${templateStyles}</style>
      <button
        type="button"
        part="trigger"
        class="trigger"
        aria-haspopup="dialog"
        aria-controls="${dialogId}"
        aria-expanded="${this.opened ? 'true' : 'false'}"
        aria-label="${escapeHtml(this.triggerLabel)}"
      >
        <span part="trigger-icon" class="trigger__icon" aria-hidden="true">${icon}</span>
        <span part="trigger-label" class="trigger__label">${escapeHtml(this.triggerLabel)}</span>
        ${shortcutLabel ? `<kbd part="keyboard-shortcut" class="kbd">${escapeHtml(shortcutLabel)}</kbd>` : ''}
      </button>
      <div part="backdrop" class="backdrop" ${this.opened ? '' : 'hidden'}>
        <section
          id="${dialogId}"
          part="dialog"
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${titleId}"
        >
          <div class="header">
            <div class="title-row">
              <h2 id="${titleId}" part="title" class="title">${escapeHtml(this.panelTitle)}</h2>
              <button type="button" part="close-button" class="close" aria-label="Close search">✕</button>
            </div>
            <input
              part="input"
              class="input"
              type="search"
              value="${escapeHtml(this.query)}"
              placeholder="${escapeHtml(this.placeholder)}"
              role="combobox"
              aria-label="${escapeHtml(this.searchLabel)}"
              aria-autocomplete="list"
              aria-expanded="${this.results.length > 0 ? 'true' : 'false'}"
              ${this.results.length > 0 ? `aria-controls="${this.elementId}-listbox"` : ''}
              ${activeResultId !== undefined ? `aria-activedescendant="${activeResultId}"` : ''}
              autocomplete="off"
              spellcheck="false"
            />
            <div part="help" class="help" aria-hidden="true">
              <span class="help__item">Navigate <kbd class="kbd">↓</kbd><kbd class="kbd">↑</kbd></span>
              <span class="help__item">Select <kbd class="kbd">↵</kbd></span>
              <span class="help__item">Close <kbd class="kbd">Esc</kbd></span>
            </div>
          </div>
          <div part="results">
            ${this.renderResults()}
          </div>
        </section>
      </div>
    `

    this.bindEvents()
  }

  private bindEvents(): void {
    this.root.querySelector('[part="trigger"]')?.addEventListener('click', () => this.open())
    this.root.querySelector('[part="close-button"]')?.addEventListener('click', () => this.close())
    this.root.querySelector('[part="backdrop"]')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) {
        this.close()
      }
    })
    this.root
      .querySelector<HTMLElement>('[part="dialog"]')
      ?.addEventListener('keydown', this.onDialogKeydown)
    this.root.querySelector('[part="input"]')?.addEventListener('input', this.onInput)
    this.bindResultEvents()
  }
}

export function defineMdSearchElement(name = 'md-search'): void {
  if (
    globalThis.customElements === undefined ||
    globalThis.customElements.get(name) !== undefined
  ) {
    return
  }

  globalThis.customElements.define(name, MdSearchElement)
}

export function createSearch(options: import('./types').CreateSearchOptions): MdSearchElement {
  defineMdSearchElement()

  const element = document.createElement('md-search') as MdSearchElement

  if (options.src !== undefined) element.setAttribute('src', options.src)
  if (options.placeholder !== undefined) element.setAttribute('placeholder', options.placeholder)
  if (options.triggerLabel !== undefined)
    element.setAttribute('trigger-label', options.triggerLabel)
  if (options.panelTitle !== undefined) element.setAttribute('panel-title', options.panelTitle)
  if (options.searchLabel !== undefined) element.setAttribute('search-label', options.searchLabel)
  if (options.theme !== undefined) element.setAttribute('theme', options.theme)
  if (options.shortcut !== undefined) element.setAttribute('shortcut', options.shortcut)
  if (options.minQueryLength !== undefined)
    element.setAttribute('min-query-length', String(options.minQueryLength))
  if (options.maxResults !== undefined)
    element.setAttribute('max-results', String(options.maxResults))
  if (options.showDuplicateResults === true) element.setAttribute('show-duplicate-results', '')
  if (options.provider !== undefined) element.provider = options.provider

  options.target.append(element)

  return element
}
