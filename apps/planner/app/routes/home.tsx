import { useFetchers, useLoaderData } from 'react-router';
import { CaptureCard } from '@/components/capture/capture-card';
import { formatDateHeader, groupCapturesByDate } from '@/lib/capture.util';
import { CaptureService } from '@/services/capture.service.server';
import type { CaptureWithRelations } from '@/types/capture.type';

export async function loader() {
  const captures = await CaptureService.findAll();
  return { captures };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get('action');
  const captureId = formData.get('captureId') as string;

  if (action === 'delete') {
    await CaptureService.delete(captureId);
    return { success: true };
  }

  if (action === 'update') {
    const content = formData.get('content') as string;
    const context = formData.get('context') as string | null;
    const tags = formData.get('tags') as string;
    const dueDate = formData.get('dueDate') as string | null;
    const parsedTags = tags ? JSON.parse(tags) : [];

    await CaptureService.update(captureId, {
      content,
      context: context || undefined,
      tags: parsedTags,
      dueDate: dueDate || undefined,
    });
    return { success: true };
  }

  if (action === 'updateStatus') {
    const status = formData.get('status') as
      | 'PENDING'
      | 'IN_PROGRESS'
      | 'COMPLETED';

    await CaptureService.updateStatus(captureId, status);
    return { success: true };
  }

  return { success: false };
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
        <h1 className="text-2xl font-bold">타임라인</h1>
        <div className="text-muted-foreground text-sm">
          {allCaptures.length}개 캡처
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
          <p className="text-muted-foreground mb-4">아직 캡처가 없습니다</p>
          <p className="text-muted-foreground text-sm">
            <kbd className="rounded border px-2 py-1 text-xs">⌘K</kbd>를 눌러 첫
            캡처를 만들어보세요
          </p>
        </div>
      )}
    </div>
  );
}
