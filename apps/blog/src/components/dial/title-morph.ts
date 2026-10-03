'use client';

// 홈 질문 다이얼에서 연 질문의 제목이 글 제목까지 이어지게 한다 (ADR 0006).
// Next 라우팅은 새 화면이 그려지는 시점을 알려 주지 않으므로, 글 제목이 마운트될 때
// `completeTitleMorph`가 도착한 제목을 넘겨 View Transition의 갱신 단계를 끝낸다.
// 제목이 오지 않으면 시간 제한으로 끝낸다.

const TRANSITION_NAME = 'post-title';
const ARRIVAL_TIMEOUT_MS = 1500;

let pendingArrival: PromiseWithResolvers<HTMLElement | null> | null = null;

const canMorph = () =>
  typeof document.startViewTransition === 'function' &&
  typeof Promise.withResolvers === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startTitleMorph(source: HTMLElement, navigate: () => void) {
  if (!canMorph()) {
    navigate();
    return;
  }

  const arrival = Promise.withResolvers<HTMLElement | null>();
  pendingArrival = arrival;
  const timer = window.setTimeout(
    () => arrival.resolve(null),
    ARRIVAL_TIMEOUT_MS,
  );
  let arrivedTitle: HTMLElement | null = null;

  source.style.viewTransitionName = TRANSITION_NAME;
  const transition = document.startViewTransition(async () => {
    navigate();
    arrivedTitle = await arrival.promise;
    window.clearTimeout(timer);
    if (pendingArrival === arrival) pendingArrival = null;
    if (arrivedTitle) arrivedTitle.style.viewTransitionName = TRANSITION_NAME;
  });

  // 탭이 숨겨졌거나 상태가 바뀌어 전환이 중단돼도 이동 자체는 이미 끝났다.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      source.style.viewTransitionName = '';
      if (arrivedTitle) arrivedTitle.style.viewTransitionName = '';
    });
}

export function completeTitleMorph(target: HTMLElement) {
  pendingArrival?.resolve(target);
}
