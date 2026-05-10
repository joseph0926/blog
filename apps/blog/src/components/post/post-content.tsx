import { cn } from '@joseph0926/ui/lib/utils';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef } from 'react';
import remarkGfm from 'remark-gfm';
import type { AppLocale } from '@/i18n/routing';
import { getMdxComponentsForSource } from '@/mdx/component-registry';
import { MdxLink } from '@/mdx/components/mdx-link';
import { getPostContent } from '@/services/post.service';
import { PostCodeBlock } from './post-code-block';
import { createHeadingIdFactory, getNodeText } from './post-toc';

interface PostContentProps {
  slug: string;
  locale: AppLocale;
  source?: string;
}

const labels = {
  ko: {
    copyCode: '코드 복사',
    copiedCode: '복사됨',
  },
  en: {
    copyCode: 'Copy code',
    copiedCode: 'Copied',
  },
} satisfies Record<
  AppLocale,
  {
    copyCode: string;
    copiedCode: string;
  }
>;

export async function PostContent({
  slug,
  locale,
  source: providedSource,
}: PostContentProps) {
  const source = providedSource ?? (await getPostContent(slug, locale)).source;
  const components = await getMdxComponentsForSource(source);
  const createHeadingId = createHeadingIdFactory();
  const label = labels[locale];

  const { content } = await compileMDX({
    source,
    components: {
      a: MdxLink,
      h2: ({
        className,
        children,
        id,
        ...props
      }: ComponentPropsWithoutRef<'h2'>) => (
        <h2
          id={id ?? createHeadingId(getNodeText(children))}
          className={cn(
            'border-border/70 scroll-mt-28 border-t pt-10 text-2xl font-semibold tracking-tight',
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
            'scroll-mt-28 text-xl font-semibold tracking-tight',
            className,
          )}
          {...props}
        >
          {children}
        </h3>
      ),
      table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
        <div className="border-border/70 my-7 overflow-x-auto border-y">
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
            'border-primary/50 bg-muted/30 my-7 border-l-2 px-5 py-3 text-base not-italic',
            className,
          )}
          {...props}
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
      },
    },
  });

  return content;
}
