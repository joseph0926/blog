// @vitest-environment happy-dom

import {
  completeTitleMorph,
  startTitleMorph,
} from '@/components/dial/title-morph';

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.titleTransition;
});

test('대상 제목이 도착하면 탐색을 마치고 전환 종료 뒤 이름과 표시 지연을 정리한다', async () => {
  const source = document.createElement('a');
  const target = document.createElement('h1');
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let updated!: Promise<void>;
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: vi.fn((update: () => Promise<void>) => {
      updated = Promise.resolve().then(update);
      return { ready: updated, finished, skipTransition: vi.fn() };
    }),
  });
  const navigate = vi.fn(() => completeTitleMorph(target));
  startTitleMorph(source, navigate);
  expect(source.style.viewTransitionName).toBe('post-title');
  expect(document.documentElement.dataset.titleTransition).toBe('active');
  await updated;
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(target.style.viewTransitionName).toBe('post-title');
  finish();
  await finished;
  await Promise.resolve();
  await Promise.resolve();
  expect(source.style.viewTransitionName).toBe('');
  expect(target.style.viewTransitionName).toBe('');
  expect(document.documentElement.dataset.titleTransition).toBeUndefined();
});

test('지원하지 않는 환경에서도 한 번 탐색하고 본문 표시 지연을 남기지 않는다', () => {
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: undefined,
  });
  const navigate = vi.fn();
  startTitleMorph(document.createElement('a'), navigate);
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(document.documentElement.dataset.titleTransition).toBeUndefined();
});

test('대상 제목이 오지 않아도 시간 제한 뒤 전환을 끝낼 수 있다', async () => {
  vi.useFakeTimers();
  let updated!: Promise<void>;
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: vi.fn((update: () => Promise<void>) => {
      updated = Promise.resolve().then(update);
      return { ready: updated, finished: updated, skipTransition: vi.fn() };
    }),
  });
  const navigate = vi.fn();
  startTitleMorph(document.createElement('a'), navigate);
  await Promise.resolve();
  expect(navigate).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1500);
  await updated;
  await Promise.resolve();
  await Promise.resolve();
  expect(document.documentElement.dataset.titleTransition).toBeUndefined();
});

test('시작 자체가 거절돼도 일반 탐색을 하고 표시 지연을 정리한다', () => {
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: vi.fn(() => {
      throw new Error('unavailable');
    }),
  });
  const source = document.createElement('a');
  const navigate = vi.fn();
  startTitleMorph(source, navigate);
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(source.style.viewTransitionName).toBe('');
  expect(document.documentElement.dataset.titleTransition).toBeUndefined();
});

test('연속해서 다른 질문을 열면 이전 탐색을 취소하고 마지막 질문만 연다', async () => {
  const updates: Promise<void>[] = [];
  const skip = vi.fn();
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: vi.fn((update: () => Promise<void>) => {
      const updated = Promise.resolve().then(update);
      updates.push(updated);
      return { ready: updated, finished: updated, skipTransition: skip };
    }),
  });
  const source = document.createElement('a');
  const first = vi.fn();
  const second = vi.fn(() => completeTitleMorph(document.createElement('h1')));
  startTitleMorph(source, first);
  startTitleMorph(source, second);
  await Promise.all(updates);
  await Promise.resolve();
  await Promise.resolve();
  expect(skip).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);
  expect(source.style.viewTransitionName).toBe('');
  expect(document.documentElement.dataset.titleTransition).toBeUndefined();
});
