import { z } from 'zod';

export const updatePostSchema = z.object({
  thumbnail: z.string().min(1),
});
export type UpdatePostSchemaType = z.infer<typeof updatePostSchema>;
