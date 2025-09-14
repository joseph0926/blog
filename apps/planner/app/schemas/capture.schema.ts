import { z } from 'zod';

export const CaptureTypeSchema = z.enum([
  'LEARNING_NEED',
  'IDEA',
  'PR',
  'PROJECT',
]);

export const CaptureStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const CreateCaptureSchema = z.object({
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(500, '500자 이내로 입력해주세요')
    .trim(),

  type: CaptureTypeSchema.default('LEARNING_NEED'),

  context: z
    .string()
    .max(200, '200자 이내로 입력해주세요')
    .trim()
    .optional()
    .nullable(),

  tags: z
    .array(
      z
        .string()
        .min(1, '태그는 1자 이상이어야 합니다')
        .max(20, '태그는 20자 이내여야 합니다')
        .regex(
          /^[a-zA-Z0-9가-힣-_]+$/,
          '태그는 알파벳, 숫자, 한글, -, _ 만 사용 가능합니다',
        ),
    )
    .max(5, '태그는 최대 5개까지 추가할 수 있습니다')
    .optional(),
});

export const UpdateCaptureSchema = z.object({
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(500, '500자 이내로 입력해주세요')
    .trim()
    .optional(),

  type: CaptureTypeSchema.optional(),

  status: CaptureStatusSchema.optional(),

  context: z
    .string()
    .max(200, '200자 이내로 입력해주세요')
    .trim()
    .optional()
    .nullable(),

  tags: z
    .array(z.string())
    .max(5, '태그는 최대 5개까지 추가할 수 있습니다')
    .optional(),
});

export type CreateCaptureInput = z.infer<typeof CreateCaptureSchema>;
export type UpdateCaptureInput = z.infer<typeof UpdateCaptureSchema>;
