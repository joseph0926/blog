'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import type { MouseEvent } from 'react';
import { startTitleMorph } from '@/components/dial/title-morph';
import { usePinnedReel } from '@/components/dial/use-dial';
import { Link, useRouter } from '@/i18n/navigation';

export type DialPost = {
  slug: string;
  title: string;
  description: string;
  year: string;
  meta: string;
};

type QuestionDialProps = {
  posts: DialPost[];
  heading: string;
  readLabel: string;
};

const REEL = { space: 30, weight: { center: 640, edge: 240 } };

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/**
 * 홈의 질문 다이얼 (ADR 0006). 스크롤이 질문 릴 전체를 한 덩어리로 돌리고,
 * 가운데 질문을 열면 그 제목이 글 제목으로 이어진다.
 */
export function QuestionDial({ posts, heading, readLabel }: QuestionDialProps) {
  const router = useRouter();
  const {
    mode,
    trackRef,
    stageRef,
    itemRef,
    getItem,
    centerIndex,
    scrollToIndex,
  } = usePinnedReel<HTMLAnchorElement>(posts.length, REEL);
  const isReel = mode === 'reel';
  const current = posts[centerIndex] ?? posts[0];

  const openPost = (index: number) => {
    const source = getItem(index);
    const href = `/post/${posts[index].slug}`;
    if (!source) {
      router.push(href);
      return;
    }
    startTitleMorph(source, () => router.push(href));
  };

  const handleItemClick = (event: MouseEvent, index: number) => {
    if (!isReel || !isPlainClick(event)) return;
    event.preventDefault();
    if (index === centerIndex) {
      openPost(index);
    } else {
      scrollToIndex(index);
    }
  };

  const handleReadClick = (event: MouseEvent) => {
    if (!isReel || !isPlainClick(event)) return;
    event.preventDefault();
    openPost(centerIndex);
  };

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="question-dial-heading">
      <h2 id="question-dial-heading" className="sr-only">
        {heading}
      </h2>
      <div
        ref={trackRef}
        className="relative"
        style={
          isReel
            ? { height: `calc(${posts.length - 1} * 50svh + 100svh)` }
            : undefined
        }
      >
        {isReel &&
          posts.map((post, index) => (
            <div
              key={post.slug}
              aria-hidden="true"
              className="absolute left-0 h-px w-px snap-start"
              style={{ top: `calc(${index} * 50svh)` }}
            />
          ))}
        <div
          ref={stageRef}
          className={cn(
            'mx-auto max-w-[1260px] px-4',
            isReel &&
              'sticky top-0 grid h-svh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden pt-14 pb-7 lg:grid-cols-[11rem_minmax(0,1fr)_18rem] lg:grid-rows-1 lg:gap-12 lg:pb-0',
          )}
        >
          {isReel && (
            <p
              aria-hidden="true"
              className="text-muted-foreground pt-4 font-serif text-[1.75rem] font-[250] tracking-[-0.03em] tabular-nums lg:self-center lg:pt-0 lg:text-[2.75rem]"
            >
              {current.year}
            </p>
          )}
          <ol className={cn(isReel ? 'relative' : 'space-y-10 py-16 sm:py-24')}>
            {posts.map((post, index) => (
              <li key={post.slug}>
                <Link
                  ref={itemRef(index)}
                  href={`/post/${post.slug}`}
                  onClick={(event) => handleItemClick(event, index)}
                  onFocus={() => {
                    if (isReel && index !== centerIndex) scrollToIndex(index);
                  }}
                  aria-current={
                    isReel && index === centerIndex ? 'true' : undefined
                  }
                  className={cn(
                    'text-foreground focus-visible:ring-ring block max-w-[11.5em] rounded-sm font-serif tracking-[-0.03em] break-keep focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none',
                    isReel
                      ? 'absolute top-1/2 left-0 origin-top-left text-[clamp(2.125rem,4.4vw,3.5rem)]/[1.18] will-change-transform'
                      : 'text-[1.75rem]/[1.25] font-medium sm:text-4xl/[1.2]',
                    isReel &&
                      index !== centerIndex &&
                      'hover:text-accent-ink transition-colors duration-150',
                  )}
                >
                  {post.title}
                </Link>
                {!isReel && (
                  <div className="mt-3 max-w-[40em]">
                    <p className="text-muted-foreground text-sm">{post.meta}</p>
                    <p className="text-muted-foreground mt-2 text-[15px] leading-[1.7]">
                      {post.description}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {isReel && (
            <aside aria-live="polite" className="lg:self-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                >
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {current.meta}
                  </p>
                  <p className="text-foreground/80 mt-3.5 hidden text-[15px] leading-[1.7] lg:block">
                    {current.description}
                  </p>
                  <Link
                    href={`/post/${current.slug}`}
                    onClick={handleReadClick}
                    tabIndex={-1}
                    className="bg-foreground text-background hover:bg-accent-ink mt-4 inline-flex rounded-[5px] px-4 py-2 text-sm font-semibold transition-colors duration-150 lg:mt-6"
                  >
                    {readLabel}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
