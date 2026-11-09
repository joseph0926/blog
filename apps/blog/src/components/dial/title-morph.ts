'use client';

// 홈 질문 다이얼에서 연 질문의 제목이 글 제목까지 이어지게 한다 (ADR 0006).
// Next 라우팅은 새 화면이 그려지는 시점을 알려 주지 않으므로, 글 제목이 마운트될 때
// `completeTitleMorph`가 도착한 제목을 넘겨 View Transition의 갱신 단계를 끝낸다.
// 제목이 오지 않으면 시간 제한으로 끝낸다.

const TRANSITION_NAME = 'post-title';
const ARRIVAL_TIMEOUT_MS = 1500;

type TitleMorph = {
  source: HTMLElement;
  target: HTMLElement | null;
  arrival: PromiseWithResolvers<HTMLElement | null>;
  timer: number;
  transition: ViewTransition | null;
};

let activeMorph: TitleMorph | null = null;

function clearMorph(morph: TitleMorph) {
  window.clearTimeout(morph.timer);
  morph.source.style.viewTransitionName = '';
  if (morph.target) morph.target.style.viewTransitionName = '';
  if (activeMorph === morph) {
    activeMorph = null;
    delete document.documentElement.dataset.titleTransition;
  }
}

const canMorph = () =>
  typeof document.startViewTransition === 'function' &&
  typeof Promise.withResolvers === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startTitleMorph(source: HTMLElement, navigate: () => void) {
  if (activeMorph) {
    const previous = activeMorph;
    previous.transition?.skipTransition();
    previous.arrival.resolve(null);
    clearMorph(previous);
  }

  if (!canMorph()) {
    navigate();
    return;
  }

  const arrival = Promise.withResolvers<HTMLElement | null>();
  const morph: TitleMorph = {
    source,
    target: null,
    arrival,
    timer: window.setTimeout(() => arrival.resolve(null), ARRIVAL_TIMEOUT_MS),
    transition: null,
  };
  activeMorph = morph;

  source.style.viewTransitionName = TRANSITION_NAME;
  document.documentElement.dataset.titleTransition = 'active';
  let navigated = false;
  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(async () => {
      if (activeMorph !== morph) return;
      navigated = true;
      navigate();
      const target = await arrival.promise;
      window.clearTimeout(morph.timer);
      if (activeMorph === morph && target) {
        morph.target = target;
        target.style.viewTransitionName = TRANSITION_NAME;
      }
    });
    morph.transition = transition;
  } catch {
    clearMorph(morph);
    if (!navigated) navigate();
    return;
  }

  // 탭이 숨겨졌거나 상태가 바뀌어 전환이 중단돼도 이동 자체는 이미 끝났다.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (activeMorph === morph) clearMorph(morph);
    });
}

export function completeTitleMorph(target: HTMLElement) {
  activeMorph?.arrival.resolve(target);
}
