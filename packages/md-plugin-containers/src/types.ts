import type Token from 'markdown-it/lib/token.mjs'
import container from 'markdown-it-container'
import type MarkdownIt from 'markdown-it'

export type Container = typeof container

export type CreateContainerFn = (
  container: Container,
  type: string,
  defaultTitle: string,
  md: MarkdownIt,
) => [Container, string, any?]

export interface ContainerDetails {
  type: string
  defaultTitle: string
}

export interface ContainerOptions {
  render(tokens: Token[], idx: number): string
}
