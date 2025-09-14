import { createCapture } from '@/services/capture.service.server';
import type { CreateCaptureInput } from '@/types/capture.type';
import type { Route } from '../+types/home';

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();

    const content = formData.get('content') as string;
    const type = formData.get('type') as CreateCaptureInput['type'];
    const context = formData.get('context') as string | null;
    const tagsJson = formData.get('tags') as string | null;
    const dueDate = formData.get('dueDate') as string | null;

    if (!content || !content.trim()) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    const tags = tagsJson ? JSON.parse(tagsJson) : undefined;

    const capture = await createCapture({
      content: content.trim(),
      type: type || 'LEARNING_NEED',
      context: context || undefined,
      tags,
      dueDate: dueDate || undefined,
    });

    return Response.json({ success: true, capture });
  } catch (error) {
    console.error('Failed to create capture:', error);
    return Response.json(
      { error: 'Failed to create capture' },
      { status: 500 },
    );
  }
}

export async function loader() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
