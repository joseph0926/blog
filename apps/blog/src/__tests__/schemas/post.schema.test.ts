import { createPostSchema, updatePostSchema } from '@/schemas/post.schema';

describe('schemas/post.schema를 테스트합니다.', () => {
  const validInput = {
    title: '테스트 제목',
    description: '테스트 설명입니다.',
    tags: ['react'],
  };

  describe('createPostSchema를 테스트합니다.', () => {
    it('유효한 입력이면 parse에 성공해야 합니다.', () => {
      const result = createPostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('빈 제목이면 에러 메시지를 반환해야 합니다.', () => {
      const result = createPostSchema.safeParse({
        ...validInput,
        title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목을 입력해 주세요.');
      }
    });

    it('제목이 100자를 초과하면 에러 메시지를 반환해야 합니다.', () => {
      const result = createPostSchema.safeParse({
        ...validInput,
        title: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '제목은 100자 이하여야 합니다.',
        );
      }
    });

    it('빈 설명이면 에러를 반환해야 합니다.', () => {
      const result = createPostSchema.safeParse({
        ...validInput,
        description: '',
      });
      expect(result.success).toBe(false);
    });

    it('빈 태그 배열이면 에러 메시지를 반환해야 합니다.', () => {
      const result = createPostSchema.safeParse({
        ...validInput,
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '태그를 1개 이상 선택해 주세요.',
        );
      }
    });

    it('thumbnail은 optional이므로 없어도 성공해야 합니다.', () => {
      const withThumbnail = createPostSchema.safeParse({
        ...validInput,
        thumbnail: 'https://example.com/img.png',
      });
      const withoutThumbnail = createPostSchema.safeParse(validInput);

      expect(withThumbnail.success).toBe(true);
      expect(withoutThumbnail.success).toBe(true);
    });
  });

  describe('updatePostSchema를 테스트합니다.', () => {
    it('유효한 입력이면 parse에 성공해야 합니다.', () => {
      const result = updatePostSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('빈 제목이면 에러를 반환해야 합니다.', () => {
      const result = updatePostSchema.safeParse({
        ...validInput,
        title: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
