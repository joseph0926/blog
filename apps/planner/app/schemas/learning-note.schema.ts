import { z } from 'zod';

export const createLearningNoteSchema = z.object({
  captureId: z.string().cuid(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  summary: z.string().optional(),
  resources: z.array(z.string().url()).optional().default([]),
  isPublic: z.boolean().optional().default(false),
});

export const updateLearningNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  summary: z.string().optional(),
  resources: z.array(z.string().url()).optional(),
  isPublic: z.boolean().optional(),
});

export type CreateLearningNoteInput = z.infer<typeof createLearningNoteSchema>;
export type UpdateLearningNoteInput = z.infer<typeof updateLearningNoteSchema>;
