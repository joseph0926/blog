'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { cn } from '@joseph0926/ui/lib/utils';
import { format } from 'date-fns';
import { ArrowUpRight, Calendar, Clock, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ENV } from '@/lib/env';
import { PostResponse } from '@/types/post.type';

type BlogPostCardProps = {
  post: PostResponse;
  featured?: boolean;
  index?: number;
};

const getPostGradient = (index: number) => {
  const gradients = [
    'from-blue-500/10 to-cyan-500/10',
    'from-purple-500/10 to-pink-500/10',
    'from-green-500/10 to-emerald-500/10',
    'from-orange-500/10 to-red-500/10',
    'from-indigo-500/10 to-blue-500/10',
  ];
  return gradients[index % gradients.length];
};

const getCodePreview = (slug: string) => {
  const previews: Record<string, string> = {
    'react-query-issue': 'const data = use(fetchData())',
    suspense: '<Suspense fallback={<Loading />}>',
    trpc: 'const todos = await trpc.getTodos.query()',
  };
  return previews[slug] || 'const [state, setState] = useState()';
};

const getReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
};

export const BlogPostCard = ({
  post,
  featured = false,
  index = 0,
}: BlogPostCardProps) => {
  const codePreview = getCodePreview(post.slug);
  const readingTime = getReadingTime(post.description);

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative col-span-full"
      >
        <Link href={`/post/${post.slug}`}>
          <div className="border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-xl border transition-all duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative h-64 overflow-hidden md:h-full">
                <div
                  className={cn(
                    `absolute inset-0 bg-gradient-to-br opacity-60`,
                    getPostGradient(0),
                  )}
                />
                <Image
                  src={post?.thumbnail ?? '/logo/logo.webp'}
                  fill
                  priority
                  unoptimized={ENV === 'dev'}
                  alt={post.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <div className="text-muted-foreground mb-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.createdAt), 'yyyy.MM.dd')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readingTime} min read
                    </span>
                  </div>
                  <h2 className="group-hover:text-primary mb-3 text-xl font-bold transition-colors md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="bg-muted/50 dark:bg-muted/20 mb-4 overflow-hidden rounded-lg p-3 font-mono text-xs">
                    <span className="text-primary">{codePreview}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/post/${post.slug}`}>
        <div className="border-border bg-card hover:border-primary/50 relative h-full overflow-hidden rounded-lg border transition-all duration-300">
          <div
            className={cn(
              `absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100`,
              getPostGradient(index),
            )}
          />
          <div className="relative p-5">
            <div className="text-muted-foreground mb-3 flex items-center gap-3 text-xs">
              <span>{format(new Date(post.createdAt), 'MMM dd')}</span>
              <span>•</span>
              <span>{readingTime} min</span>
            </div>
            <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold transition-colors">
              {post.title}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
              {post.description}
            </p>
            <div className="bg-muted/30 dark:bg-muted/10 text-muted-foreground mb-3 overflow-hidden rounded p-2 font-mono text-xs">
              <Code2 className="mr-1 inline h-3 w-3" />
              <span className="opacity-60">{codePreview}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="px-2 py-0.5 text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
