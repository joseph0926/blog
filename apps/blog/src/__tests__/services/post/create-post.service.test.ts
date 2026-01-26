import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { createPost } from '@/services/post/create-post.service';

const postsPath = path.join(process.cwd(), 'src/mdx');
const uniqueId = crypto.randomUUID();
const DUMMY_POST_1 = {
  title: `vitest-test-mdx_test-post-${uniqueId}`,
  description: 'test post description.',
  tags: ['javascript', 'react'],
};
const DUMMY_POST_2 = {
  title: `vitest-test-mdx_test-post-${uniqueId}`,
  description: 'test post description 2222.',
  tags: ['react', 'typescript'],
};

describe('createPost를 테스트합니다.', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
  });

  afterEach(() => {
    const files = fs.readdirSync(postsPath);
    for (const file of files) {
      if (file.includes('vitest-test-mdx_')) {
        fs.rmSync(path.join(postsPath, file));
      }
    }
  });

  describe('createPost service를 테스트합니다.', () => {
    it('createPost 호출시 DB에 글이 생성되어야합니다.', async () => {
      const createdPost = await createPost({ ...DUMMY_POST_1 }, prisma);

      const post = await prisma.post.findUnique({
        where: {
          slug: createdPost.slug,
        },
      });

      expect(post).not.toBeNull();
    });

    it('createPost로 생성된 post는 input의 값이 존재해야합니다.', async () => {
      const post = await createPost({ ...DUMMY_POST_1 }, prisma);

      expect(post.title).toBe(DUMMY_POST_1.title);
      expect(post.description).toBe(DUMMY_POST_1.description);
      expect(post.tags.map((t) => t.name).sort()).toEqual(
        DUMMY_POST_1.tags.sort(),
      );
    });

    it('createPost로 MDX 파일이 생성되어야합니다.', async () => {
      const post = await createPost({ ...DUMMY_POST_1 }, prisma);

      const expectedFileName = `${post.slug}.mdx`;
      const filePath = path.join(postsPath, expectedFileName);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('중복된 slug일 경우 -2 접미사가 붙어서 생성되어야합니다.', async () => {
      const post1 = await createPost({ ...DUMMY_POST_1 }, prisma);
      const post2 = await createPost({ ...DUMMY_POST_2 }, prisma);

      expect(post2.slug).toContain('-2');
      expect(post2.slug).not.toBe(post1.slug);
    });
  });
});
