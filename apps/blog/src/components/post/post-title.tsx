'use client';

import { useLayoutEffect, useRef } from 'react';
import { completeTitleMorph } from '@/components/dial/title-morph';

/**
 * 홈 다이얼에서 연 질문이 이 제목으로 이어진다. 마운트되는 순간 전환의 갱신 단계를 끝낸다.
 * View Transition snapshot은 비율이 다르면 늘어나므로, 글자 크기와 최대 폭을 홈 다이얼 항목과 같게 둔다.
 */
export function PostTitle({ id, title }: { id: string; title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (ref.current) completeTitleMorph(ref.current);
  }, []);

  return (
    <h1
      ref={ref}
      id={id}
      className="text-foreground max-w-[11.5em] font-serif text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.18] font-[640] tracking-[-0.03em] break-keep"
    >
      {title}
    </h1>
  );
}
