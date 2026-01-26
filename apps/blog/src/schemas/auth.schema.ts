import { z } from 'zod';

export const authSchema = z.object({
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .max(100, { message: '비밀번호가 너무 깁니다.' }),
});
export type AuthSchemaType = z.infer<typeof authSchema>;
