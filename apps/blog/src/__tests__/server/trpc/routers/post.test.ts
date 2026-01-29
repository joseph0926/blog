import fs from 'node:fs';
import path from 'node:path';
import { postRouter } from '@/server/trpc/routers/post';
import { createCallerFactory } from '@/server/trpc/trpc';
import { createPost } from '@/services/post/create-post.service';

const postsPath = path.join(process.cwd(), 'src/mdx');
const uniqueId = crypto.randomUUID();
const tagName = `vitest-tag-${uniqueId}`;
const postPrefix = `vitest-test-mdx-${uniqueId}`;

const createDummyPost = (index: number) =>
  createPost({
    title: `${postPrefix}-${index}`,
    description: `설명 ${index}`,
    tags: [tagName],
  });

describe('trpc/routers/postRouter를 테스트합니다.', () => {
  const createCaller = createCallerFactory(postRouter);
  const mockContext = {
    user: null,
    req: undefined,
  };

  let caller: ReturnType<typeof createCaller>;

  beforeEach(async () => {
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    const files = fs.readdirSync(postsPath);
    for (const file of files) {
      if (file.includes(postPrefix)) {
        fs.rmSync(path.join(postsPath, file));
      }
    }
  });

  describe('getPosts를 테스트합니다.', () => {
    it('글이 없는 경우 빈배열을 반환해야합니다.', async () => {
      const result = await caller.getPosts({
        limit: 5,
        filter: { category: `empty-${tagName}` },
      });

      expect(result.posts).toHaveLength(0);
    });

    describe('글이 존재하는 경우를 테스트합니다.', () => {
      it('limit보다 적은 글이 있는 경우 nextCursor가 없어야 합니다', async () => {
        await Promise.all(
          Array.from({ length: 5 }, (_, i) => createDummyPost(i)),
        );

        const result = await caller.getPosts({
          limit: 10,
          filter: { category: tagName },
        });

        expect(result.posts).toHaveLength(5);
        expect(result.nextCursor).toBeUndefined();
        expect(result.message).toBe('최신 글을 불러왔습니다.');

        for (let i = 0; i < result.posts.length - 1; i++) {
          expect(
            result.posts[i].createdAt >= result.posts[i + 1].createdAt,
          ).toBe(true);
        }
      });

      it('limit보다 많은 글이 있는 경우 nextCursor가 있어야 합니다', async () => {
        await Promise.all(
          Array.from({ length: 11 }, (_, i) => createDummyPost(i)),
        );

        const result = await caller.getPosts({
          limit: 10,
          filter: { category: tagName },
        });

        expect(result.posts).toHaveLength(10);
        expect(result.nextCursor).not.toBeUndefined();
      });

      it('페이지네이션 기능이 동작해야합니다.', async () => {
        await Promise.all(
          Array.from({ length: 15 }, (_, i) => createDummyPost(i)),
        );

        const result = await caller.getPosts({
          limit: 10,
          filter: { category: tagName },
        });

        expect(result.posts).toHaveLength(10);
        expect(result.nextCursor).not.toBeUndefined();

        const result2 = await caller.getPosts({
          limit: 10,
          cursor: result.nextCursor,
          filter: { category: tagName },
        });

        expect(result2.posts).toHaveLength(5);
        expect(result2.nextCursor).toBeUndefined();
      });
    });
  });

  describe('getTags를 테스트합니다.', () => {
    it('태그 목록을 반환해야 합니다.', async () => {
      await Promise.all(
        Array.from({ length: 3 }, (_, i) => createDummyPost(i)),
      );

      const result = await caller.getTags();
      const tags = result.tags.map((tag) => tag.name);

      expect(tags).toContain(tagName);
      expect(result.message).toBe('태그를 불러왔습니다.');
    });
  });
});
