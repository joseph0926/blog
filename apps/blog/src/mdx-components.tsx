import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="my-4 text-4xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="my-3 text-3xl font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="my-2 text-2xl font-medium">{children}</h3>
    ),
    ul: ({ children }) => <ul className="list-disc pl-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4">{children}</ol>,
    ...components,
  };
}
