// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PostCodeBlock } from '@/components/post/post-code-block';

const source =
  'const first = 1;\n'.repeat(24) + 'const last = "복사할 마지막 줄";';
const labels = {
  copyLabel: '코드 복사',
  copiedLabel: '복사됨',
  copyErrorLabel: '복사 실패',
  expandLabel: '전체 코드 보기',
  collapseLabel: '코드 접기',
};

let root: Root;
let container: HTMLDivElement;
let contentHeight: number;
let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  contentHeight = 480;
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
    () => contentHeight,
  );
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

const renderCode = () =>
  act(async () => {
    root.render(
      <PostCodeBlock {...labels}>
        <code className="language-ts">{source}</code>
      </PostCodeBlock>,
    );
  });

test('긴 코드만 접고 펼쳐도 코드 전체가 남는다', async () => {
  await renderCode();
  const toggle = container.querySelector<HTMLButtonElement>('[aria-expanded]')!;
  expect(toggle.textContent).toBe('전체 코드 보기');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(container.querySelector('pre')!.textContent).toBe(source);
  await act(async () => toggle.click());
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(toggle.textContent).toBe('코드 접기');
  expect(container.querySelector('pre')!.textContent).toBe(source);
});

test('240px 이하의 코드에는 펼치기 버튼을 만들지 않는다', async () => {
  contentHeight = 240;
  await renderCode();
  expect(container.querySelector('[aria-expanded]')).toBeNull();
});

test('접힌 코드도 마지막 줄까지 복사하고 1200ms 뒤에 완료 표시를 지운다', async () => {
  vi.useFakeTimers();
  await renderCode();
  const copy = container.querySelector<HTMLButtonElement>(
    '[aria-label="코드 복사"]',
  )!;
  await act(async () => copy.click());
  expect(writeText).toHaveBeenCalledExactlyOnceWith(source);
  expect(copy.getAttribute('aria-label')).toBe('복사됨');
  expect(container.querySelector('[role="status"]')!.textContent).toBe(
    '복사됨',
  );
  await act(async () => vi.advanceTimersByTime(1200));
  expect(copy.getAttribute('aria-label')).toBe('코드 복사');
});

test('복사 실패를 성공으로 표시하지 않는다', async () => {
  writeText.mockRejectedValueOnce(new Error('denied'));
  await renderCode();
  await act(async () =>
    container
      .querySelector<HTMLButtonElement>('[aria-label="코드 복사"]')!
      .click(),
  );
  expect(container.querySelector('[role="status"]')!.textContent).toBe(
    '복사 실패',
  );
  expect(container.querySelector('[aria-label="복사됨"]')).toBeNull();
});

test('화면을 떠난 뒤 복사가 끝나도 새 타이머를 만들지 않는다', async () => {
  vi.useFakeTimers();
  let finishCopy!: () => void;
  writeText.mockReturnValueOnce(
    new Promise<void>((resolve) => {
      finishCopy = resolve;
    }),
  );
  await renderCode();
  await act(async () =>
    container
      .querySelector<HTMLButtonElement>('[aria-label="코드 복사"]')!
      .click(),
  );
  await act(async () => root.render(null));
  finishCopy();
  await act(async () => {});
  expect(vi.getTimerCount()).toBe(0);
});
