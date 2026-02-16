import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef } from 'react';
import remarkGfm from 'remark-gfm';
import type { AppLocale } from '@/i18n/routing';
import { getMdxComponentsForSource } from '@/mdx/component-registry';
import { MdxLink } from '@/mdx/components/mdx-link';
import { getPostContent } from '@/services/post.service';

interface PostContentProps {
  slug: string;
  locale: AppLocale;
}

export async function PostContent({ slug, locale }: PostContentProps) {
  const { source } = await getPostContent(slug, locale);

  const components = await getMdxComponentsForSource(source);

  const { content } = await compileMDX({
    source,
    components: {
      a: MdxLink,
      table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
        <table
          className={['w-max min-w-[720px] table-auto', className]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      ),
      pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
        <pre
          className={[
            'overflow-x-auto break-words whitespace-pre-wrap',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      ),
      code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
        <code
          className={['break-words', className].filter(Boolean).join(' ')}
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
