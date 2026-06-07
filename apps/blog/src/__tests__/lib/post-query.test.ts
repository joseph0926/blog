import {
  getPostsQueryInput,
  parsePostListFilter,
  POST_LIST_LIMIT,
} from '@/lib/post-query';

describe('lib/post-query를 테스트합니다.', () => {
  describe('parsePostListFilter 함수를 테스트합니다.', () => {
    it('q 파라미터를 search로 매핑하고 category/year는 그대로 둬야합니다.', () => {
      expect(
        parsePostListFilter({ category: 'react', q: 'cache', year: '2025' }),
      ).toEqual({ category: 'react', search: 'cache', year: '2025' });
    });

    it('값이 없으면 undefined여야합니다.', () => {
      expect(parsePostListFilter({})).toEqual({
        category: undefined,
        search: undefined,
        year: undefined,
      });
    });

    it('배열로 들어오면 첫 값을 써야합니다.', () => {
      expect(parsePostListFilter({ category: ['react', 'nextjs'] })).toEqual({
        category: 'react',
        search: undefined,
        year: undefined,
      });
    });
  });

  describe('getPostsQueryInput 함수를 테스트합니다.', () => {
    it('limit은 POST_LIST_LIMIT(16)이고 filter는 항상 3키를 가져야합니다.', () => {
      const input = getPostsQueryInput('ko', { category: 'react' });
      expect(input.limit).toBe(POST_LIST_LIMIT);
      expect(input.locale).toBe('ko');
      expect(input.filter).toEqual({
        category: 'react',
        search: undefined,
        year: undefined,
      });
    });

    it('잘못된 year(4자리 아님)는 undefined로 정규화해야 합니다.', () => {
      expect(
        getPostsQueryInput('ko', { year: 'abc' }).filter.year,
      ).toBeUndefined();
      expect(
        getPostsQueryInput('ko', { year: '20' }).filter.year,
      ).toBeUndefined();
      expect(getPostsQueryInput('ko', { year: '2025' }).filter.year).toBe(
        '2025',
      );
    });

    it('server(raw params 파싱)와 client(추출값) 입력이 동일해야 합니다 — 키 drift 방지.', () => {
      // 같은 URL: /blog?category=react
      const serverInput = getPostsQueryInput(
        'ko',
        parsePostListFilter({ category: 'react' }),
      );
      const clientInput = getPostsQueryInput('ko', {
        category: 'react',
        search: undefined,
        year: undefined,
      });
      expect(serverInput).toEqual(clientInput);
    });

    it('무필터에서도 server/client 입력이 동일해야 합니다.', () => {
      const serverInput = getPostsQueryInput('ko', parsePostListFilter({}));
      const clientInput = getPostsQueryInput('ko', {
        category: undefined,
        search: undefined,
        year: undefined,
      });
      expect(serverInput).toEqual(clientInput);
    });
  });
});
