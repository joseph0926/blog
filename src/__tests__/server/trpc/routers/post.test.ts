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
