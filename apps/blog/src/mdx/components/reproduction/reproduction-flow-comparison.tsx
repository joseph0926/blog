'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { cn } from '@joseph0926/ui/lib/utils';
import { Link2, Play, RotateCcw } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

type Locale = 'ko' | 'en';
type Flow = 'before' | 'after';

type FlowCopy = {
  title: string;
  description: string;
  steps: string[];
  play: string;
  reset: string;
};

type Copy = {
  title: string;
  description: string;
  tabsLabel: string;
  beforeTab: string;
  afterTab: string;
  before: FlowCopy;
  after: FlowCopy;
};

const COPY: Record<Locale, Copy> = {
  ko: {
    title: '버그 전달 흐름은 어떻게 달라졌을까',
    description:
      '변경 전과 후를 재생해 계정과 화면 위치를 다시 찾는 단계가 어떻게 줄었는지 비교합니다.',
    tabsLabel: '비교할 흐름',
    beforeTab: '변경 전',
    afterTab: '변경 후',
    before: {
      title: '변경 전',
      description: '설명을 받은 사람이 같은 화면을 직접 다시 찾아야 했습니다.',
      steps: [
        'QA가 Slack에 계정 ID, 탭과 사용 기능을 적습니다.',
        '개발자가 계정을 다시 검색합니다.',
        '설명에 맞춰 탭과 세부 위치로 이동합니다.',
        '화면이 다르면 서로의 위치를 다시 확인합니다.',
      ],
      play: '변경 전 흐름 재생',
      reset: '변경 전 흐름 처음부터',
    },
    after: {
      title: '변경 후',
      description: '브라우저 주소가 계정과 화면 위치를 함께 전달했습니다.',
      steps: [
        'QA가 현재 화면의 링크를 Slack에 붙여 넣습니다.',
        '링크를 받은 사람이 같은 계정, 탭과 세부 위치로 들어갑니다.',
      ],
      play: '변경 후 흐름 재생',
      reset: '변경 후 흐름 처음부터',
    },
  },
  en: {
    title: 'How the bug handoff changed',
    description:
      'Play both flows to compare how many steps were spent finding the same account and screen location.',
    tabsLabel: 'Flow to compare',
    beforeTab: 'Before',
    afterTab: 'After',
    before: {
      title: 'Before',
      description:
        'The recipient had to reconstruct the same screen from a written description.',
      steps: [
        'QA writes the account ID, tab, and feature in Slack.',
        'The developer searches for the account again.',
        'They follow the description to the tab and nested location.',
        'If the screens differ, both people check their locations again.',
      ],
      play: 'Play the before flow',
      reset: 'Reset the before flow',
    },
    after: {
      title: 'After',
      description:
        'The browser address carried the account and screen location together.',
      steps: [
        'QA pastes the current screen URL into Slack.',
        'The recipient opens the same account, tab, and nested location.',
      ],
      play: 'Play the after flow',
      reset: 'Reset the after flow',
    },
  },
};

function FlowPanel({ flow, copy }: { flow: Flow; copy: FlowCopy }) {
  const reduceMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (visibleCount >= copy.steps.length) return;

    const timer = window.setTimeout(() => {
      setVisibleCount((current) => current + 1);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [copy.steps.length, playing, visibleCount]);

  const play = () => {
    if (reduceMotion) {
      setVisibleCount(copy.steps.length);
      setPlaying(false);
      return;
    }
    setVisibleCount(0);
    setPlaying(true);
  };

  const reset = () => {
    setVisibleCount(0);
    setPlaying(false);
  };

  const isAfter = flow === 'after';

  return (
    <section
      className={cn(
        'flex h-full flex-col rounded-2xl border p-4 sm:p-5',
        isAfter
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-amber-500/30 bg-amber-500/5',
      )}
      data-testid={`reproduction-flow-${flow}`}
    >
      <div className="flex min-h-20 items-start justify-between gap-3">
        <div>
          <div
            className={cn(
              'mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
              isAfter
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
            )}
          >
            {copy.title}
          </div>
          <p className="text-muted-foreground m-0 text-sm leading-6">
            {copy.description}
          </p>
        </div>
        {isAfter && (
          <Link2
            aria-hidden="true"
            className="mt-1 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300"
          />
        )}
      </div>
      <ol className="my-5 grid list-none gap-2 p-0" aria-live="polite">
        {copy.steps.map((step, index) => {
          const visible = index < visibleCount;

          return (
            <motion.li
              key={step}
              aria-hidden={!visible}
              className={cn(
                'bg-background/80 m-0 flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2.5',
                visible ? 'border-border' : 'border-border/50 border-dashed',
              )}
              initial={false}
              animate={{
                opacity: visible ? 1 : 0.25,
                y: visible || reduceMotion ? 0 : 8,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  visible
                    ? isAfter
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm leading-5">{step}</span>
            </motion.li>
          );
        })}
      </ol>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={play}
          disabled={playing && visibleCount < copy.steps.length}
        >
          <Play aria-hidden="true" className="h-4 w-4" />
          {copy.play}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          {copy.reset}
        </Button>
      </div>
    </section>
  );
}

export function ReproductionFlowComparison({
  locale = 'ko',
}: {
  locale?: Locale;
}) {
  const copy = COPY[locale];
  const [activeFlow, setActiveFlow] = useState<Flow>('before');

  return (
    <Card className="not-prose border-border/70 bg-card my-8 overflow-hidden p-4 sm:p-6">
      <div className="mb-5">
        <h3 className="m-0 text-lg font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-2 mb-0 text-sm leading-6">
          {copy.description}
        </p>
      </div>
      <div
        className="mb-4 grid grid-cols-2 gap-2 md:hidden"
        role="group"
        aria-label={copy.tabsLabel}
      >
        <Button
          size="sm"
          variant={activeFlow === 'before' ? 'default' : 'outline'}
          aria-pressed={activeFlow === 'before'}
          onClick={() => setActiveFlow('before')}
        >
          {copy.beforeTab}
        </Button>
        <Button
          size="sm"
          variant={activeFlow === 'after' ? 'default' : 'outline'}
          aria-pressed={activeFlow === 'after'}
          onClick={() => setActiveFlow('after')}
        >
          {copy.afterTab}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={cn(activeFlow !== 'before' && 'hidden md:block')}>
          <FlowPanel flow="before" copy={copy.before} />
        </div>
        <div className={cn(activeFlow !== 'after' && 'hidden md:block')}>
          <FlowPanel flow="after" copy={copy.after} />
        </div>
      </div>
    </Card>
  );
}
