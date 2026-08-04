import container from 'markdown-it-container'
import type { MarkdownIt } from 'markdown-it'
import type { Token } from 'markdown-it'
import type { StateCore } from 'markdown-it'
import type { StepsHeadingLevel, StepsPluginOptions, StepsTitleTag } from './types'

interface StepGroup {
  title: string
  tokens: Token[]
}

interface StepItemMeta {
  number: number
  title: string
}

const defaultHeadingLevels: StepsHeadingLevel[] = [2, 3, 4, 5, 6]

const allowedTitleTags = new Set<StepsTitleTag>(['h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p'])

function normalizeTitleTag(tag: StepsTitleTag | undefined): StepsTitleTag {
  return tag !== undefined && allowedTitleTags.has(tag) ? tag : 'h3'
}

function isTopLevelToken(token: Token | undefined, level: number): token is Token {
  return token !== undefined && token.level === level
}

function getHeadingTitle(
  tokens: Token[],
  index: number,
  contentLevel: number,
  headingLevels: Set<StepsHeadingLevel>,
): { title: string; nextIndex: number } | undefined {
  const openToken = tokens[index]
  const inlineToken = tokens[index + 1]
  const closeToken = tokens[index + 2]

  if (
    isTopLevelToken(openToken, contentLevel) === false ||
    openToken.type !== 'heading_open' ||
    inlineToken?.type !== 'inline' ||
    closeToken?.type !== 'heading_close'
  ) {
    return undefined
  }

  const headingLevel = Number(openToken.tag.slice(1)) as StepsHeadingLevel

  if (headingLevels.has(headingLevel) === false) {
    return undefined
  }

  return {
    title: inlineToken.content.trim(),
    nextIndex: index + 3,
  }
}

function getMarkerTitle(
  tokens: Token[],
  index: number,
  contentLevel: number,
  marker: string,
): { title: string; nextIndex: number } | undefined {
  const openToken = tokens[index]
  const inlineToken = tokens[index + 1]
  const closeToken = tokens[index + 2]

  if (
    isTopLevelToken(openToken, contentLevel) === false ||
    openToken.type !== 'paragraph_open' ||
    inlineToken?.type !== 'inline' ||
    closeToken?.type !== 'paragraph_close'
  ) {
    return undefined
  }

  const content = inlineToken.content.trim()

  if (content.startsWith(marker) === false) {
    return undefined
  }

  const markerBody = content.slice(marker.length).trim()
  const newlineIndex = markerBody.indexOf('\n')

  return {
    title: (newlineIndex === -1 ? markerBody : markerBody.slice(0, newlineIndex)).trim(),
    nextIndex: index + 3,
  }
}

function createStepOpenToken(state: StateCore, number: number, title: string): Token {
  const token = new state.Token('steps_item_open', 'section', 1)
  token.block = true
  token.meta = { number, title } satisfies StepItemMeta

  return token
}

function createStepCloseToken(state: StateCore): Token {
  const token = new state.Token('steps_item_close', 'section', -1)
  token.block = true

  return token
}

function splitContainerTokens(
  state: StateCore,
  containerOpenIndex: number,
  containerCloseIndex: number,
  contentLevel: number,
  headingLevels: Set<StepsHeadingLevel>,
  marker: string,
  enableAlternateMarker: boolean,
): Token[] | undefined {
  const innerTokens = state.tokens.slice(containerOpenIndex + 1, containerCloseIndex)
  const prefixTokens: Token[] = []
  const stepGroups: StepGroup[] = []
  let currentTokens: Token[] = []
  let currentTitle = ''
  let stepsStarted = false

  const pushCurrentStep = (): void => {
    stepGroups.push({
      title: currentTitle,
      tokens: currentTokens,
    })
    currentTokens = []
  }

  for (let index = 0; index < innerTokens.length;) {
    const headingMatch = getHeadingTitle(innerTokens, index, contentLevel, headingLevels)
    const markerMatch =
      enableAlternateMarker === true
        ? getMarkerTitle(innerTokens, index, contentLevel, marker)
        : undefined
    const match = headingMatch ?? markerMatch

    if (match !== undefined) {
      if (stepsStarted === true) {
        pushCurrentStep()
      } else {
        prefixTokens.push(...currentTokens)
        currentTokens = []
        stepsStarted = true
      }

      currentTitle = match.title
      index = match.nextIndex
      continue
    }

    currentTokens.push(innerTokens[index] as Token)
    index++
  }

  if (stepsStarted === false) {
    return undefined
  }

  pushCurrentStep()

  const stepTokens: Token[] = []

  stepGroups.forEach((step, index) => {
    stepTokens.push(createStepOpenToken(state, index + 1, step.title))
    stepTokens.push(...step.tokens)
    stepTokens.push(createStepCloseToken(state))
  })

  return [...prefixTokens, ...stepTokens]
}

export const stepsPlugin = (
  md: MarkdownIt,
  {
    containerName = 'steps',
    stepsClass = 'markdown-steps',
    stepClass = 'markdown-step',
    stepMarkerClass = 'markdown-step__marker',
    stepContentClass = 'markdown-step__content',
    stepTitleClass = 'markdown-step__title',
    headingLevels = defaultHeadingLevels,
    titleTag,
    enableAlternateMarker = true,
    marker = '%step%',
  }: StepsPluginOptions = {},
): void => {
  const containerOpenType = `container_${containerName}_open`
  const containerCloseType = `container_${containerName}_close`
  const headingLevelSet = new Set(headingLevels)
  const renderedTitleTag = normalizeTitleTag(titleTag)

  const compatibleContainer = container as unknown as (
    instance: MarkdownIt,
    name: string,
    options: { render(tokens: Token[], index: number): string },
  ) => void

  compatibleContainer(md, containerName, {
    render(tokens: Token[], index: number): string {
      return tokens[index]?.nesting === 1 ? `<div class="${stepsClass}" role="list">\n` : '</div>\n'
    },
  })

  md.core.ruler.push('steps_split', (state: StateCore): void => {
    const tokens = state.tokens

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]

      if (token?.type !== containerOpenType) {
        continue
      }

      const containerOpenIndex = index
      const containerLevel = token.level
      const contentLevel = containerLevel + 1
      let containerCloseIndex = -1

      for (let closeIndex = index + 1; closeIndex < tokens.length; closeIndex++) {
        const closeToken = tokens[closeIndex]

        if (closeToken?.type === containerCloseType && closeToken.level === containerLevel) {
          containerCloseIndex = closeIndex
          break
        }
      }

      if (containerCloseIndex === -1) {
        continue
      }

      const replacementTokens = splitContainerTokens(
        state,
        containerOpenIndex,
        containerCloseIndex,
        contentLevel,
        headingLevelSet,
        marker,
        enableAlternateMarker,
      )

      if (replacementTokens === undefined) {
        continue
      }

      tokens.splice(
        containerOpenIndex + 1,
        containerCloseIndex - containerOpenIndex - 1,
        ...replacementTokens,
      )

      index = containerOpenIndex + replacementTokens.length + 1
    }
  })

  md.renderer.rules.steps_item_open = (tokens: Token[], index: number): string => {
    const meta = tokens[index]?.meta as unknown as StepItemMeta | undefined
    const stepNumber = meta?.number ?? ''
    const title = meta?.title ?? ''
    const renderedTitle =
      title.length > 0
        ? `<${renderedTitleTag} class="${stepTitleClass}">${md.renderInline(title)}</${renderedTitleTag}>`
        : ''

    return `<section class="${stepClass}" role="listitem"><div class="${stepMarkerClass}" aria-hidden="true">${stepNumber}</div><div class="${stepContentClass}">${renderedTitle}`
  }

  md.renderer.rules.steps_item_close = (): string => '</div></section>\n'
}
