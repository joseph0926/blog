// @vitest-environment happy-dom

import type NextLink from 'next/link';
import { act, type ComponentProps, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  PostLink,
  PostReturnLink,
  rememberPostOrigin,
} from '@/components/post/post-navigation';

const state = vi.hoisted(() => ({ locale: 'ko', push: vi.fn() }));
type TestLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  onNavigate?: ComponentProps<typeof NextLink>['onNavigate'];
};
vi.mock('next/link', () => ({
  default: ({ href, onNavigate, children, ...props }: TestLinkProps) => (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0 &&
          props.target !== '_blank'
        ) {
          onNavigate?.({ preventDefault: () => event.preventDefault() });
        }
      }}
    >
      {children}
    </a>
  ),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('next-intl', () => ({ useLocale: () => state.locale }));
vi.mock('@/i18n/navigation', async () => ({
  Link: (await import('next/link')).default,
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    locale === 'en' ? `/en${href}` : href,
}));

let root: Root;
let container: HTMLDivElement;
let traverseTo: ReturnType<typeof vi.fn>;
beforeEach(() => {
  state.locale = 'ko';
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  traverseTo = vi.fn(() => ({
    committed: Promise.resolve(),
    finished: Promise.resolve(),
  }));
  vi.stubGlobal('navigation', {
    currentEntry: { key: 'source' },
    entries: () => [{ key: 'source' }, { key: 'post' }, { key: 'section' }],
    traverseTo,
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
const render = (node: ReactNode) => act(async () => root.render(node));

test('홈에서 연 글은 목차 이동을 거쳤어도 원래 홈 기록으로 돌아간다', async () => {
  history.replaceState(null, '', '/');
  rememberPostOrigin('from-home');
  history.replaceState(null, '', '/post/from-home#second-section');
  await render(<PostReturnLink postSlug="from-home" />);
  const link = container.querySelector('a')!;
  expect(link.textContent).toBe('돌아가기');
  expect(link.getAttribute('href')).toBe('/');
  await act(async () => link.click());
  expect(traverseTo).toHaveBeenCalledExactlyOnceWith('source');
});

test('검색 목록에서 연 글은 검색어와 필터를 포함한 주소로 돌아간다', async () => {
  history.replaceState(null, '', '/blog?q=AI&year=2026');
  await render(
    <PostLink postSlug="from-search" href="/post/from-search">
      글
    </PostLink>,
  );
  await act(async () => container.querySelector('a')!.click());
  await render(<PostReturnLink postSlug="from-search" />);
  expect(container.querySelector('a')!.getAttribute('href')).toBe(
    '/blog?q=AI&year=2026',
  );
});

test('직접 연 글은 외부 방문 기록으로 이동하지 않고 모든 글로 안내한다', async () => {
  history.replaceState(null, '', '/post/direct');
  await render(<PostReturnLink postSlug="direct" />);
  const link = container.querySelector('a')!;
  expect(link.textContent).toBe('모든 글');
  expect(link.getAttribute('href')).toBe('/blog');
  await act(async () => link.click());
  expect(traverseTo).not.toHaveBeenCalled();
});

test('방문 기록 API가 없어도 들어온 화면 주소를 링크로 유지한다', async () => {
  vi.stubGlobal('navigation', undefined);
  history.replaceState(null, '', '/blog?q=test');
  rememberPostOrigin('without-api');
  await render(<PostReturnLink postSlug="without-api" />);
  expect(container.querySelector('a')!.getAttribute('href')).toBe(
    '/blog?q=test',
  );
});

test('영문 직접 방문의 목록 링크는 영문 경로를 쓴다', async () => {
  state.locale = 'en';
  await render(<PostReturnLink postSlug="direct-en" />);
  expect(container.querySelector('a')!.textContent).toBe('All posts');
  expect(container.querySelector('a')!.getAttribute('href')).toBe('/en/blog');
});

test('이전 방문 기록이 사라졌으면 주소 링크로 돌아간다', async () => {
  history.replaceState(null, '', '/');
  rememberPostOrigin('expired-entry');
  vi.stubGlobal('navigation', { entries: () => [], traverseTo });
  await render(<PostReturnLink postSlug="expired-entry" />);
  await act(async () => container.querySelector('a')!.click());
  expect(traverseTo).not.toHaveBeenCalled();
  expect(container.querySelector('a')!.getAttribute('href')).toBe('/');
});

test('기록 이동이 실패하면 원래 주소로 탐색한다', async () => {
  history.replaceState(null, '', '/blog?q=AI');
  rememberPostOrigin('traversal-failed');
  traverseTo.mockImplementation(() => ({
    committed: Promise.reject(new Error('entry removed')),
    finished: Promise.reject(new Error('entry removed')),
  }));
  await render(<PostReturnLink postSlug="traversal-failed" />);
  await act(async () => container.querySelector('a')!.click());
  expect(state.push).toHaveBeenCalledWith('/blog?q=AI');
});

test('사용자가 다른 탐색으로 취소한 경우 이전 주소로 덮어쓰지 않는다', async () => {
  history.replaceState(null, '', '/');
  rememberPostOrigin('traversal-aborted');
  traverseTo.mockImplementation(() => ({
    committed: Promise.reject(new DOMException('cancelled', 'AbortError')),
    finished: Promise.reject(new DOMException('cancelled', 'AbortError')),
  }));
  await render(<PostReturnLink postSlug="traversal-aborted" />);
  await act(async () => container.querySelector('a')!.click());
  expect(state.push).not.toHaveBeenCalled();
});
