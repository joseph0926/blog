'use client';

import { useEffect, useMemo, useState } from 'react';

type Options = {
  rootMargin?: string;
};

export function useActiveSection(
  ids: string[],
  { rootMargin = '-112px 0px -62% 0px' }: Options = {},
) {
  const key = ids.join('|');
  const stableIds = useMemo(() => key.split('|').filter(Boolean), [key]);
  const [observedId, setObservedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (stableIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setObservedId(visible[0].target.id);
        }
      },
      { rootMargin, threshold: [0, 1] },
    );

    stableIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [stableIds, rootMargin]);

  return observedId && stableIds.includes(observedId)
    ? observedId
    : stableIds[0];
}
