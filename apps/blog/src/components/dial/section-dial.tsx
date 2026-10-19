'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type MouseEvent, useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import styles from './section-dial.module.css';
import { useDialMode, useSectionDial } from './use-dial';

export type SectionDialItem = {
  /** 기준점 요소의 id. `null`이면 문서 맨 위(도입)를 뜻한다. */
  id: string | null;
  label: string;
};

type SectionDialProps = {
  items: SectionDialItem[];
  label: string;
  back?: { href: string; label: string };
  /** 휴대폰에서 이 제목이 헤더 뒤로 지나간 뒤에만 현재 절 띠를 보여 준다. */
  mobileBarAfterId?: string;
};

const REEL = { space: 14, weight: { center: 620, edge: 300 } };
const HEADER_HEIGHT = 56;

/**
 * 여백의 절 다이얼 (ADR 0006). 읽는 동안 멈춰 있다가 다음 기준점이 읽는 선에 다가올 때만 돈다.
 * 휴대폰에서는 다이얼 대신 헤더 밑에서 미끄러져 나오는 띠가 현재 절을 보여 준다.
 */
export function SectionDial({
  items,
  label,
  back,
  mobileBarAfterId,
}: SectionDialProps) {
  const { mode, itemRef, current } = useSectionDial<HTMLAnchorElement>(
    items.map((item) => item.id),
    REEL,
  );
  const isReel = mode === 'reel';

  const jump = (event: MouseEvent, id: string | null) => {
    if (id !== null) return;
    event.preventDefault();
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <nav
        aria-label={label}
        className={cn(
          styles.navigation,
          'sticky top-0 hidden h-svh self-start lg:block',
        )}
      >
        {back && (
          <Link
            href={back.href}
            className="bg-muted text-foreground hover:bg-accent focus-visible:ring-ring absolute top-24 left-0 z-10 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {back.label}
          </Link>
        )}
        <ol
          className={cn(
            styles.items,
            isReel
              ? 'pointer-events-none absolute inset-0'
              : 'space-y-2.5 pt-44',
          )}
        >
          {items.map((item, index) => (
            <li key={item.id ?? 'top'}>
              <a
                ref={itemRef(index)}
                href={item.id ? `#${item.id}` : '#'}
                onClick={(event) => jump(event, item.id)}
                aria-current={index === current ? 'location' : undefined}
                className={cn(
                  'hover:text-accent-ink focus-visible:ring-ring pointer-events-auto block rounded-sm font-serif tracking-[-0.015em] break-keep transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                  isReel
                    ? 'text-foreground absolute top-[40%] left-0 w-full origin-top-left text-[19px] leading-[1.35] will-change-transform'
                    : cn(
                        'text-[15px] leading-[1.45]',
                        index === current
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground',
                      ),
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {mobileBarAfterId && (
        <MobileSectionBar
          label={items[current]?.label ?? ''}
          afterId={mobileBarAfterId}
        />
      )}
    </>
  );
}

function MobileSectionBar({
  label,
  afterId,
}: {
  label: string;
  afterId: string;
}) {
  const [visible, setVisible] = useState(false);
  const mode = useDialMode();

  useEffect(() => {
    const title = document.getElementById(afterId);
    if (!title) return;
    const sync = () =>
      setVisible(title.getBoundingClientRect().bottom < HEADER_HEIGHT);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [afterId]);

  // 헤더(z-50) 밑에 깔려 있다가 아래로 미끄러져 나온다. 바탕은 늘 불투명해 본문이 비치지 않는다.
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-muted text-foreground/80 fixed inset-x-0 top-14 z-40 grid overflow-hidden px-4 py-2 font-serif text-[14.5px] leading-[1.4] transition-transform duration-[180ms] ease-out motion-reduce:transition-none lg:hidden',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      {mode === 'reel' ? (
        <AnimatePresence initial={false}>
          <motion.span
            key={label}
            className="col-start-1 row-start-1 min-w-0 truncate"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </div>
  );
}
