import { prisma } from '@/lib/prisma';
import { postRouter } from '@/server/trpc/routers/post';
import { createCallerFactory } from '@/server/trpc/trpc';

describe('trpc/routers/postRouter를 테스트합니다.', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
  });

  describe('getTags를 테스트합니다.', () => {
    it('태그 목록을 반환해야 합니다.', async () => {
      await prisma.tag.createMany({
        data: [
          { name: 'javascript' },
          { name: 'typescript' },
          { name: 'react' },
        ],
      });

      const createCaller = createCallerFactory(postRouter);

      const caller = createCaller({
        prisma,
        user: null,
        req: undefined,
      });

      const result = await caller.getTags();

      expect(result.tags).toHaveLength(3);
      expect(result.message).toBe('태그를 불러왔습니다.');
    });
  });
});
