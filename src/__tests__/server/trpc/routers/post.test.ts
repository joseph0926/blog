import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';
import { postRouter } from '@/server/trpc/routers/post';
import { createCallerFactory } from '@/server/trpc/trpc';

describe('trpc/routers/postRouter를 테스트합니다.', () => {
  const createCaller = createCallerFactory(postRouter);
  const mockContext = {
    prisma,
    user: null,
    req: undefined,
  };

  let caller: ReturnType<typeof createCaller>;

  beforeEach(async () => {
    caller = createCaller(mockContext);

    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
  });

  describe('getPosts를 테스트합니다.', () => {
    it('글이 없는 경우 빈배열을 반환해야합니다.', async () => {
      const limit = 5;
      const result = await caller.getPosts({ limit });

      expect(result.posts).toHaveLength(0);
    });

    describe('글이 존재하는 경우를 테스트합니다.', () => {
      it('limit보다 적은 글이 있는 경우 nextCursor가 없어야 합니다', async () => {
        const baseDate = new Date('2025-01-01');

        await Promise.all(
          Array.from({ length: 5 }, (_, i) =>
            prisma.post.create({
              data: {
                slug: `test-post-${i}`,
                title: `테스트 포스트 ${i}`,
                description: `설명 ${i}`,
                createdAt: new Date(baseDate.getTime() + i * 1000 * 60),
              },
            }),
          ),
        );

        const result = await caller.getPosts({ limit: 10 });

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
        const baseDate = new Date('2025-01-01');

        await Promise.all(
          Array.from({ length: 11 }, (_, i) =>
            prisma.post.create({
              data: {
                slug: `test-post-${i}`,
                title: `테스트 포스트 ${i}`,
                description: `설명 ${i}`,
                createdAt: new Date(baseDate.getTime() + i * 1000 * 60),
              },
            }),
          ),
        );

        const result = await caller.getPosts({ limit: 10 });

        expect(result.posts).toHaveLength(10);
        expect(result.nextCursor).not.toBeUndefined();

        for (let i = 0; i < result.posts.length - 1; i++) {
          expect(
            result.posts[i].createdAt >= result.posts[i + 1].createdAt,
          ).toBe(true);
        }
      });

      it('페이지네이션 기능이 동작해야합니다.', async () => {
        const baseDate = new Date('2025-01-01');

        await Promise.all(
          Array.from({ length: 15 }, (_, i) =>
            prisma.post.create({
              data: {
                slug: `test-post-${i}`,
                title: `테스트 포스트 ${i}`,
                description: `설명 ${i}`,
                createdAt: new Date(baseDate.getTime() + i * 1000 * 60),
              },
            }),
          ),
        );

        const result = await caller.getPosts({ limit: 10 });

        expect(result.posts).toHaveLength(10);
        expect(result.nextCursor).not.toBeUndefined();

        const result2 = await caller.getPosts({
          limit: 10,
          cursor: result.nextCursor,
        });

        expect(result2.posts).toHaveLength(5);
        expect(result2.nextCursor).toBeUndefined();
      });
    });
  });

  describe('getTags를 테스트합니다.', () => {
    it('태그가 없는 경우 빈배열을 반환해야합니다.', async () => {
      const result = await caller.getTags();

      expect(result.tags).toHaveLength(0);
    });

    it('태그 목록을 반환해야 합니다.', async () => {
      await prisma.tag.createMany({
        data: [
          { name: 'javascript' },
          { name: 'typescript' },
          { name: 'react' },
        ],
      });

      const result = await caller.getTags();

      expect(result.tags).toHaveLength(3);
      expect(result.message).toBe('태그를 불러왔습니다.');
    });

    it('DB 에러 발생 시 처리해야 합니다.', async () => {
      vi.spyOn(prisma.tag, 'findMany').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('DB Error', {
          code: 'P2002',
          clientVersion: '',
        }),
      );

      await expect(caller.getTags()).rejects.toThrow(TRPCError);
    });
  });
});
