import { useFetchers, useLoaderData } from 'react-router';
import { CaptureCard } from '@/components/capture/capture-card';
import { formatDateHeader, groupCapturesByDate } from '@/lib/capture.util';
import {
  deleteCapture,
  getAllCaptures,
  updateCaptureStatus,
} from '@/services/capture.service.server';
import type { CaptureWithRelations } from '@/types/capture.type';

export async function loader() {
  const captures = await getAllCaptures();
  return { captures };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get('action');
  const captureId = formData.get('captureId') as string;

  if (action === 'delete') {
    await deleteCapture(captureId);
    return { success: true };
  }

  const status = formData.get('status') as
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED';

  await updateCaptureStatus(captureId, status);
  return { success: true };
}

export default function TimelinePage() {
  const { captures } = useLoaderData<typeof loader>();
  const fetchers = useFetchers();

  const optimisticCaptures = fetchers
    .filter(
      (f) =>
        f.formAction === '/api/capture' &&
        (f.state === 'submitting' || f.state === 'loading') &&
        f.formData,
    )
    .map((f) => {
      const formData = f.formData!;
      const tags = formData.get('tags');
      const parsedTags = tags ? JSON.parse(tags as string) : [];

      return {
        id: `optimistic-${Date.now()}`,
        content: formData.get('content') as string,
        context: formData.get('context') as string | null,
        type: formData.get('type') as CaptureWithRelations['type'],
        status: 'PENDING' as const,
        tags: parsedTags.map((name: string) => ({ id: name, name })),
        _count: { notes: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CaptureWithRelations;
    });

  const deletingIds = fetchers
    .filter(
      (f) =>
        !f.formAction &&
        f.formData?.get('action') === 'delete' &&
        (f.state === 'submitting' || f.state === 'loading'),
    )
    .map((f) => f.formData!.get('captureId') as string);

  const filteredCaptures = captures.filter(
    (capture) => !deletingIds.includes(capture.id),
  );

  const allCaptures = [...optimisticCaptures, ...filteredCaptures];

  const groupedCaptures = groupCapturesByDate(allCaptures);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <div className="text-muted-foreground text-sm">
          {allCaptures.length} captures
        </div>
      </div>
      {Object.entries(groupedCaptures).map(([date, dateCaptures]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-muted-foreground bg-background sticky top-14 py-2 text-lg font-semibold">
            {formatDateHeader(date)}
          </h2>
          <div className="space-y-3">
            {dateCaptures.map((capture) => (
              <CaptureCard
                key={capture.id}
                capture={capture}
                isOptimistic={capture.id.startsWith('optimistic-')}
              />
            ))}
          </div>
        </div>
      ))}
      {allCaptures.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No captures yet</p>
          <p className="text-muted-foreground text-sm">
            Press <kbd className="rounded border px-2 py-1 text-xs">⌘K</kbd> to
            create your first capture
          </p>
        </div>
      )}
    </div>
  );
}
