export type StepsHeadingLevel = 2 | 3 | 4 | 5 | 6

export type StepsTitleTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'p'

export interface StepsPluginOptions {
  /**
   * The markdown-it-container name to register.
   *
   * @default 'steps'
   */
  containerName?: string

  /**
   * The class for the steps container.
   *
   * @default 'markdown-steps'
   */
  stepsClass?: string

  /**
   * The class for each step item.
   *
   * @default 'markdown-step'
   */
  stepClass?: string

  /**
   * The class for the step number marker.
   *
   * @default 'markdown-step__marker'
   */
  stepMarkerClass?: string

  /**
   * The class for the step content wrapper.
   *
   * @default 'markdown-step__content'
   */
  stepContentClass?: string

  /**
   * The class for the rendered step title.
   *
   * @default 'markdown-step__title'
   */
  stepTitleClass?: string

  /**
   * Heading levels that create step boundaries inside the steps container.
   *
   * @default [2, 3, 4, 5, 6]
   */
  headingLevels?: StepsHeadingLevel[]

  /**
   * HTML tag used for rendered step titles.
   *
   * @default 'h3'
   */
  titleTag?: StepsTitleTag

  /**
   * Enables alternate marker syntax, where `%step% Title` starts a new step.
   *
   * @default true
   */
  enableAlternateMarker?: boolean

  /**
   * Marker string for alternate step boundaries.
   *
   * @default '%step%'
   */
  marker?: string
}
