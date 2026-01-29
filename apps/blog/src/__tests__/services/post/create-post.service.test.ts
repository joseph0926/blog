import fs from 'node:fs';
import path from 'node:path';
import { createPost } from '@/services/post/create-post.service';

const postsPath = path.join(process.cwd(), 'src/mdx');
const uniqueId = crypto.randomUUID();
const testPrefix = `vitest-test-mdx-${uniqueId}`;
const DUMMY_POST_1 = {
  title: `${testPrefix}-test-post`,
  description: 'test post description.',
  tags: ['javascript', 'react'],
};
const DUMMY_POST_2 = {
  title: `${testPrefix}-test-post`,
  description: 'test post description 2222.',
  tags: ['react', 'typescript'],
};

describe('createPost를 테스트합니다.', () => {
  afterEach(() => {
    const files = fs.readdirSync(postsPath);
    for (const file of files) {
      if (file.includes(testPrefix)) {
        fs.rmSync(path.join(postsPath, file));
      }
    }
  });

  describe('createPost service를 테스트합니다.', () => {
    it('createPost로 생성된 post는 input의 값이 존재해야합니다.', async () => {
      const post = await createPost({ ...DUMMY_POST_1 });

      expect(post.title).toBe(DUMMY_POST_1.title);
      expect(post.description).toBe(DUMMY_POST_1.description);
      expect(post.tags.map((t) => t.name).sort()).toEqual(
        DUMMY_POST_1.tags.sort(),
      );
    });

    it('createPost로 MDX 파일이 생성되어야합니다.', async () => {
      const post = await createPost({ ...DUMMY_POST_1 });

      const expectedFileName = `${post.slug}.mdx`;
      const filePath = path.join(postsPath, expectedFileName);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('중복된 slug일 경우 -2 접미사가 붙어서 생성되어야합니다.', async () => {
      const post1 = await createPost({ ...DUMMY_POST_1 });
      const post2 = await createPost({ ...DUMMY_POST_2 });

      expect(post2.slug).toContain('-2');
      expect(post2.slug).not.toBe(post1.slug);
    });
  });
});
