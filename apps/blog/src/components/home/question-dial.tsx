'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { startTitleMorph } from '@/components/dial/title-morph';
import { usePinnedReel } from '@/components/dial/use-dial';
import { Link, useRouter } from '@/i18n/navigation';
import { HomeSearch } from './home-search';
import styles from './question-dial.module.css';

export type DialPost = {
  slug: string;
  title: string;
  description: string;
  year: string;
  date: string;
  readingTime: string;
  topics: string;
};

type QuestionDialProps = {
  posts: DialPost[];
  totalCount: number | null;
  notice: { kind: 'error' | 'empty'; message: string } | null;
};

const REEL = { space: 32, weight: { center: 640, edge: 300 } };
// 낮은 화면은 제목, 설명과 조작부를 한 화면에 담기 어려워 정적 목록으로 제공한다.
const ROOM_FOR_REEL = '(min-height: 640px)';
const subscribeViewport = (onChange: () => void) => {
  const query = window.matchMedia(ROOM_FOR_REEL);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const hasRoomForReel = () => window.matchMedia(ROOM_FOR_REEL).matches;
const serverViewport = () => false;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/** 질문 회전과 글 제목 morph의 비율은 ADR 0006을 따른다. */
export function QuestionDial({ posts, totalCount, notice }: QuestionDialProps) {
  const t = useTranslations('home');
  const router = useRouter();
  const hasRoom = useSyncExternalStore(
    subscribeViewport,
    hasRoomForReel,
    serverViewport,
  );
  const {
    mode,
    trackRef,
    stageRef,
    itemRef,
    getItem,
    centerIndex,
    scrollToIndex,
  } = usePinnedReel<HTMLAnchorElement>(
    posts.length,
    REEL,
    hasRoom && posts.length > 0,
  );
  const isReel = mode === 'reel';
  const current = posts[centerIndex] ?? posts[0];
  const [announcedIndex, setAnnouncedIndex] = useState(0);

  useEffect(() => {
    if (!isReel) return;
    let timer: number | undefined;
    const announceAfterScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAnnouncedIndex(centerIndex), 200);
    };
    announceAfterScroll();
    window.addEventListener('scroll', announceAfterScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', announceAfterScroll);
    };
  }, [centerIndex, isReel]);

  const openPost = (index: number) => {
    const source = getItem(index);
    const href = `/post/${posts[index].slug}`;
    if (source) startTitleMorph(source, () => router.push(href));
    else router.push(href);
  };

  const handleItemClick = (event: MouseEvent, index: number) => {
    if (!isReel || !isPlainClick(event)) return;
    event.preventDefault();
    if (index === centerIndex) openPost(index);
    else scrollToIndex(index);
  };

  const handleReadClick = (event: MouseEvent) => {
    if (!isReel || !isPlainClick(event)) return;
    event.preventDefault();
    openPost(centerIndex);
  };

  const handleControlsKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    let index: number;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        index = Math.max(centerIndex - 1, 0);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        index = Math.min(centerIndex + 1, posts.length - 1);
        break;
      case 'Home':
        index = 0;
        break;
      case 'End':
        index = posts.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    scrollToIndex(index);
  };

  return (
    <section
      aria-labelledby="question-dial-heading"
      className={cn(styles.home, isReel && styles.reel)}
    >
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
          className={cn(styles.stage, isReel && styles.reelStage)}
        >
          <div className={styles.toolbar}>
            <div className={styles.heading}>
              <h2 id="question-dial-heading">{t('dialHeading')}</h2>
              <Link href="/blog" className={styles.archiveLink}>
                {totalCount === null
                  ? t('browseArchive')
                  : t('browseAll', { count: totalCount })}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <HomeSearch />
          </div>

          {notice && (
            <p
              role={notice.kind === 'error' ? 'alert' : undefined}
              className={styles.notice}
            >
              {notice.message}
            </p>
          )}

          {current && (
            <div
              className={cn(styles.workspace, isReel && styles.reelWorkspace)}
            >
              {isReel && (
                <div aria-hidden="true" className={styles.year}>
                  <span>{current.year}</span>
                  <span className={styles.yearLine} />
                </div>
              )}
              <div className={cn(isReel && styles.reelWindow)}>
                <ol
                  className={cn(
                    isReel ? styles.questions : styles.staticQuestions,
                  )}
                >
                  {posts.map((post, index) => (
                    <li key={post.slug}>
                      <Link
                        ref={itemRef(index)}
                        href={`/post/${post.slug}`}
                        onClick={(event) => handleItemClick(event, index)}
                        tabIndex={
                          isReel && index !== centerIndex ? -1 : undefined
                        }
                        aria-current={
                          isReel && index === centerIndex ? 'true' : undefined
                        }
                        className={cn(
                          styles.question,
                          isReel && styles.reelQuestion,
                        )}
                      >
                        {post.title}
                      </Link>
                      {!isReel && (
                        <div className={styles.staticSummary}>
                          <p className={styles.meta}>
                            {post.date}
                            <span>{post.readingTime}</span>
                          </p>
                          <p>{post.description}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              {isReel && (
                <aside className={styles.detail}>
                  <div className={styles.detailContent}>
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={current.slug}
                        className={styles.summary}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: -5,
                          transition: { duration: 0.08 },
                        }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      >
                        <p className={styles.meta}>
                          {current.date}
                          <span>{current.readingTime}</span>
                        </p>
                        <p className={styles.description}>
                          {current.description}
                        </p>
                        <p className={styles.topics}>{current.topics}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <Link
                    href={`/post/${current.slug}`}
                    onClick={handleReadClick}
                    className={styles.readLink}
                  >
                    {t('readEssay')}
                    <ArrowUpRight aria-hidden="true" size={17} />
                  </Link>
                </aside>
              )}
            </div>
          )}

          {isReel && (
            <nav
              aria-label={t('dialNavigation')}
              className={styles.controls}
              onKeyDown={handleControlsKey}
            >
              <p className={styles.scrollHint}>
                <ArrowDown aria-hidden="true" size={14} />
                {t('scrollHint')}
              </p>
              <div className={styles.position}>
                <p role="status" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">
                    {t('position', {
                      current: announcedIndex + 1,
                      count: posts.length,
                    })}
                  </span>
                  <span aria-hidden="true">
                    <strong>{String(centerIndex + 1).padStart(2, '0')}</strong>{' '}
                    / {String(posts.length).padStart(2, '0')}
                  </span>
                </p>
                <div className={styles.progress} aria-hidden="true">
                  <span
                    style={{
                      width: `${((centerIndex + 1) / posts.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.stepButtons}>
                <button
                  aria-label={t('previousQuestion')}
                  aria-disabled={centerIndex === 0}
                  onClick={() => scrollToIndex(Math.max(centerIndex - 1, 0))}
                >
                  <ArrowUp aria-hidden="true" size={18} />
                </button>
                <button
                  aria-label={t('nextQuestion')}
                  aria-disabled={centerIndex === posts.length - 1}
                  onClick={() =>
                    scrollToIndex(Math.min(centerIndex + 1, posts.length - 1))
                  }
                >
                  <ArrowDown aria-hidden="true" size={18} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
