import { generatePostContent, generateSlug } from '@/lib/generate-post';

describe('lib/generate-post를 테스트합니다.', () => {
  describe('generateSlug 함수를 테스트합니다.', () => {
    it('영어 입력을 소문자 kebab-case로 변환해야 합니다.', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('React Hooks Guide')).toBe('react-hooks-guide');
    });

    it('한국어 입력을 로마자로 변환해야 합니다.', () => {
      const result = generateSlug('리액트');
      expect(result).toMatch(/^[a-z0-9-]+$/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('한국어와 영어가 혼합된 입력을 처리해야 합니다.', () => {
      const result = generateSlug('리액트 Hooks 가이드');
      expect(result).toMatch(/^[a-z0-9-]+$/);
      expect(result).toContain('hooks');
    });

    it('특수문자를 제거해야 합니다.', () => {
      expect(generateSlug('hello!@#$%world')).toBe('helloworld');
      expect(generateSlug('test & demo')).toBe('test-demo');
    });

    it('연속 공백과 하이픈을 단일 하이픈으로 변환해야 합니다.', () => {
      expect(generateSlug('hello   world')).toBe('hello-world');
      expect(generateSlug('hello---world')).toBe('hello-world');
      expect(generateSlug('  hello  ')).toBe('hello');
    });

    it('빈 문자열이나 특수문자만 있으면 fallback을 반환해야 합니다.', () => {
      expect(generateSlug('!@#$%')).toMatch(/^post-\d+$/);
      expect(generateSlug('')).toMatch(/^post-\d+$/);
    });
  });

  describe('generatePostContent 함수를 테스트합니다.', () => {
    const baseInput = {
      date: '2026-03-21',
      slug: 'test-post',
      title: 'Test Post',
      description: 'A test post.',
      tags: ['react'],
    };

    it('올바른 frontmatter 포맷을 생성해야 합니다.', () => {
      const content = generatePostContent(baseInput);
      expect(content).toContain('---');
      expect(content).toContain('slug: "test-post"');
      expect(content).toContain('title: "Test Post"');
      expect(content).toContain('description: "A test post."');
      expect(content).toContain('date: "2026-03-21"');
      expect(content).toContain('tags: ["react"]');
    });

    it('thumbnail이 있으면 포함해야 합니다.', () => {
      const content = generatePostContent({
        ...baseInput,
        thumbnail: 'https://example.com/img.png',
      });
      expect(content).toContain('thumbnail: "https://example.com/img.png"');
    });

    it('thumbnail이 없거나 빈 문자열이면 생략해야 합니다.', () => {
      const withoutThumbnail = generatePostContent(baseInput);
      expect(withoutThumbnail).not.toContain('thumbnail');

      const withEmpty = generatePostContent({ ...baseInput, thumbnail: '' });
      expect(withEmpty).not.toContain('thumbnail');
    });

    it('여러 태그를 쉼표로 구분해야 합니다.', () => {
      const content = generatePostContent({
        ...baseInput,
        tags: ['react', 'typescript', 'nextjs'],
      });
      expect(content).toContain('tags: ["react", "typescript", "nextjs"]');
    });
  });
});
