import type { AppLocale } from '@/i18n/routing';

export const POST_LIST_LIMIT = 16;

export type PostListFilter = {
  category?: string;
  search?: string;
  year?: string;
};

function first(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * URL searchParams를 getPosts 필터로 정규화한다. 검색 파라미터 키는 `q`다.
 * server(page searchParams)와 client(useSearchParams)가 같은 매핑을 쓰게 한다.
 */
export function parsePostListFilter(params: {
  category?: string | string[];
  q?: string | string[];
  year?: string | string[];
}): PostListFilter {
  return {
    category: first(params.category),
    search: first(params.q),
    year: first(params.year),
  };
}

// getPosts zod 스키마의 year 제약(/^\d{4}$/)과 동일. 잘못된 ?year= 값이
// server/client 양쪽 query input으로 새어 zod 에러 query가 되지 않게
// 공유 입력 지점에서 한 번 정규화한다.
const YEAR_PATTERN = /^\d{4}$/;

/**
 * getPosts infinite query의 단일 입력 소스. server prefetch와 client
 * useInfiniteQuery가 반드시 이 함수를 거쳐 동일한 react-query 키를 만든다
 * (키 drift = dehydration mismatch 방지).
 */
export function getPostsQueryInput(locale: AppLocale, filter: PostListFilter) {
  return {
    limit: POST_LIST_LIMIT,
    locale,
    filter: {
      category: filter.category,
      search: filter.search,
      year:
        filter.year && YEAR_PATTERN.test(filter.year) ? filter.year : undefined,
    },
  };
}
