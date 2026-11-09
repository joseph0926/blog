import { cn } from '@joseph0926/ui/lib/utils';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef } from 'react';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { AppLocale } from '@/i18n/routing';
import { getMdxComponentsForSource } from '@/mdx/component-registry';
import { MdxLink } from '@/mdx/components/mdx-link';
import { PostCodeBlock } from './post-code-block';
import { createHeadingIdFactory, getNodeText } from './post-toc';

interface PostContentProps {
  locale: AppLocale;
  source: string;
  title?: string;
}

const labels = {
  ko: {
    copyCode: '코드 복사',
    copiedCode: '복사됨',
    copyError: '복사하지 못했습니다. 코드를 선택해 복사해 주세요.',
    expandCode: '전체 코드 보기',
    collapseCode: '코드 접기',
    supplement: '보충 설명',
  },
  en: {
    copyCode: 'Copy code',
    copiedCode: 'Copied',
    copyError: 'Copy failed. Select the code to copy it.',
    expandCode: 'Show all code',
    collapseCode: 'Collapse code',
    supplement: 'Additional notes',
  },
} satisfies Record<
  AppLocale,
  {
    copyCode: string;
    copiedCode: string;
    copyError: string;
    expandCode: string;
    collapseCode: string;
    supplement: string;
  }
>;

export async function PostContent({ locale, source, title }: PostContentProps) {
  const components = await getMdxComponentsForSource(source);
  const createHeadingId = createHeadingIdFactory();
  const label = labels[locale];

  const { content } = await compileMDX({
    source,
    components: {
      a: MdxLink,
      h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) =>
        title && getNodeText(children).trim() === title.trim() ? null : (
          <h1 {...props}>{children}</h1>
        ),
      h2: ({
        className,
        children,
        id,
        ...props
      }: ComponentPropsWithoutRef<'h2'>) => (
        <h2
          id={id ?? createHeadingId(getNodeText(children))}
          className={cn(
            'scroll-mt-24 font-serif text-[1.75rem] leading-[1.32] font-semibold tracking-[-0.025em] break-keep',
            className,
          )}
          {...props}
        >
          {children}
        </h2>
      ),
      h3: ({
        className,
        children,
        id,
        ...props
      }: ComponentPropsWithoutRef<'h3'>) => (
        <h3
          id={id ?? createHeadingId(getNodeText(children))}
          className={cn(
            'scroll-mt-24 font-serif text-[1.3rem] leading-[1.4] font-semibold tracking-[-0.015em] break-keep',
            className,
          )}
          {...props}
        >
          {children}
        </h3>
      ),
      table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
        <div className="border-rule my-7 overflow-x-auto border-y">
          <table
            className={cn(
              'my-0 w-max min-w-[720px] table-auto text-sm',
              className,
            )}
            {...props}
          />
        </div>
      ),
      pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
        <PostCodeBlock
          copyLabel={label.copyCode}
          copiedLabel={label.copiedCode}
          copyErrorLabel={label.copyError}
          expandLabel={label.expandCode}
          collapseLabel={label.collapseCode}
          className={cn('break-words whitespace-pre-wrap', className)}
          {...props}
        />
      ),
      code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
        <code className={cn('break-words', className)} {...props} />
      ),
      blockquote: ({
        className,
        ...props
      }: ComponentPropsWithoutRef<'blockquote'>) => (
        <blockquote
          className={cn(
            'text-foreground my-8 border-0 px-5 py-1 text-[17px] font-medium not-italic [&>p]:my-2',
            className,
          )}
          {...props}
        />
      ),
      aside: ({
        title,
        children,
        className,
        ...props
      }: ComponentPropsWithoutRef<'aside'>) => (
        <details {...props} className={cn('post-supplement', className)}>
          <summary>{title ?? label.supplement}</summary>
          <div>{children}</div>
        </details>
      ),
      details: ({
        className,
        ...props
      }: ComponentPropsWithoutRef<'details'>) => (
        <details
          {...props}
          open={false}
          className={cn('post-supplement', className)}
        />
      ),
      ...components,
    },
    options: {
      parseFrontmatter: true,
      blockJS: true,
      blockDangerousJS: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
    },
  });

  return content;
}
