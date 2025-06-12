import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email({ message: '유효하지 않은 이메일 형식입니다.' }),
  password: z
    .string()
    .min(4, { message: '비밀번호는 최소 4자리 이상이어야합니다.' })
    .max(12, { message: '비밀번호는 최대 12자리 이하여야합니다.' }),
});
export type AuthSchemaType = z.infer<typeof authSchema>;
