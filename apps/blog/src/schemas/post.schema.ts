import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 100자 이하여야 합니다.'),
  description: z.string().min(1, '설명을 입력해주세요.'),
  tags: z.array(z.string()).min(1, '최소 1개 이상의 태그를 선택해주세요.'),
  thumbnail: z.string().optional(),
});
export type CreatePostSchemaType = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 100자 이하여야 합니다.'),
  description: z.string().min(1, '설명을 입력해주세요.'),
  tags: z.array(z.string()).min(1, '최소 1개 이상의 태그를 선택해주세요.'),
  thumbnail: z.string().optional(),
});
export type UpdatePostSchemaType = z.infer<typeof updatePostSchema>;
