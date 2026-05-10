import { isValidElement, type ReactNode } from 'react';

export type PostTocItem = {
  id: string;
  text: string;
  depth: 2 | 3;
};

const stripFrontmatter = (source: string) =>
  source.replace(/^---[\s\S]*?---\s*/, '');

const stripCodeBlocks = (source: string) =>
  source.replace(/```[\s\S]*?```/g, '');

const normalizeHeadingText = (value: string) =>
  value
    .replace(/\{#[^}]+\}/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (value: string) => {
  const slug = normalizeHeadingText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return slug || 'section';
};

export const createHeadingIdFactory = () => {
  const seen = new Map<string, number>();

  return (value: string) => {
    const base = slugify(value);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
};

export const getNodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }

  if (isValidElement(node)) {
    return getNodeText((node.props as { children?: ReactNode }).children);
  }

  return '';
};

export const extractPostToc = (source: string): PostTocItem[] => {
  const body = stripCodeBlocks(stripFrontmatter(source));
  const createId = createHeadingIdFactory();
  const items: PostTocItem[] = [];
  const headingRegex = /^(#{2,3})\s+(.+?)\s*#*\s*$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(body))) {
    const text = normalizeHeadingText(match[2] ?? '');
    if (!text) continue;

    items.push({
      id: createId(text),
      text,
      depth: match[1]?.length === 3 ? 3 : 2,
    });
  }

  return items;
};
