import type { ActionFunctionArgs } from 'react-router';
import {
  createLearningNoteSchema,
  updateLearningNoteSchema,
} from '@/schemas/learning-note.schema';
import { LearningNoteService } from '@/services/learning-note.service.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    switch (intent) {
      case 'create': {
        const data = Object.fromEntries(formData);
        const resources = formData.getAll('resources') as string[];

        const validatedData = createLearningNoteSchema.parse({
          ...data,
          resources,
          isPublic: data.isPublic === 'true',
        });

        const note = await LearningNoteService.create({
          capture: { connect: { id: validatedData.captureId } },
          title: validatedData.title,
          content: validatedData.content,
          summary: validatedData.summary,
          resources: validatedData.resources,
          isPublic: validatedData.isPublic,
        });

        return { success: true, data: note };
      }

      case 'update': {
        const id = formData.get('id') as string;
        const data = Object.fromEntries(formData);
        const resources = formData.getAll('resources') as string[];

        const validatedData = updateLearningNoteSchema.parse({
          ...data,
          resources: resources.length > 0 ? resources : undefined,
          isPublic: data.isPublic ? data.isPublic === 'true' : undefined,
        });

        const note = await LearningNoteService.update(id, validatedData);
        return { success: true, data: note };
      }

      case 'delete': {
        const id = formData.get('id') as string;
        await LearningNoteService.delete(id);
        return { success: true };
      }

      case 'get-by-capture': {
        const captureId = formData.get('captureId') as string;
        const notes = await LearningNoteService.findByCaptureId(captureId);
        return { success: true, data: notes };
      }

      case 'get-by-id': {
        const id = formData.get('id') as string;
        const note = await LearningNoteService.findById(id);
        return { success: true, data: note };
      }

      default:
        return { success: false, error: 'Invalid intent' };
    }
  } catch (error) {
    console.error('Learning note action error:', error);
    return { success: false, error: 'Failed to process request' };
  }
}
