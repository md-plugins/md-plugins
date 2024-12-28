import type Token from 'markdown-it/lib/token.mjs';
import container from 'markdown-it-container';

export type Container = typeof container;

export type CreateContainerFn = (
  container: Container,
  type: string,
  defaultTitle: string
) => [Container, string, any?];

export interface ContainerDetails {
  type: string;
  defaultTitle: string;
}

export interface ContainerOptions {
  render(tokens: Token[], idx: number): string;
}
