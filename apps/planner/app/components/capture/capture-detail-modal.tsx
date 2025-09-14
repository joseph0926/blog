import { Button } from '@joseph0926/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@joseph0926/ui/components/dialog';
import { cn } from '@joseph0926/ui/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit,
  Hash,
  Target,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { CaptureWithRelations } from '@/types/capture.type';

type CaptureDetailModalProps = {
  capture: CaptureWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CaptureDetailModal = ({
  capture,
  open,
  onOpenChange,
}: CaptureDetailModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(capture.content);
  const [editContext, setEditContext] = useState(capture.context || '');
  const [editTags, setEditTags] = useState(
    capture.tags.map((tag) => tag.name).join(', '),
  );
  const [editDueDate, setEditDueDate] = useState(
    capture.dueDate ? format(new Date(capture.dueDate), 'yyyy-MM-dd') : '',
  );

  const fetcher = useFetcher();

  const isUpdating =
    fetcher.state !== 'idle' && fetcher.formData?.get('action') === 'update';

  const StatusIcon = {
    PENDING: Circle,
    IN_PROGRESS: Clock,
    COMPLETED: CheckCircle2,
  }[capture.status];

  const typeConfig = {
    LEARNING_NEED: {
      label: '학습 필요',
      code: 'LRN',
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      icon: Target,
    },
    IDEA: {
      label: '아이디어',
      code: 'IDX',
      color: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      icon: Zap,
    },
    PR: {
      label: 'PR',
      code: 'PRX',
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      icon: AlertTriangle,
    },
    PROJECT: {
      label: '프로젝트',
      code: 'PRJ',
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      icon: AlertTriangle,
    },
  }[capture.type];

  const statusConfig = {
    PENDING: {
      label: '대기중',
      color: 'text-neutral-500 dark:text-neutral-400',
      bgColor: 'bg-neutral-500/10',
    },
    IN_PROGRESS: {
      label: '진행중',
      color: 'text-cyan-500 dark:text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    COMPLETED: {
      label: '완료',
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
  }[capture.status];

  const TypeIcon = typeConfig.icon;

  const handleSave = () => {
    const tags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    fetcher.submit(
      {
        action: 'update',
        captureId: capture.id,
        content: editContent,
        context: editContext,
        tags: JSON.stringify(tags),
        dueDate: editDueDate,
      },
      {
        method: 'POST',
      },
    );

    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditContent(capture.content);
    setEditContext(capture.context || '');
    setEditTags(capture.tags.map((tag) => tag.name).join(', '));
    setEditDueDate(
      capture.dueDate ? format(new Date(capture.dueDate), 'yyyy-MM-dd') : '',
    );
    setIsEditMode(false);
  };

  const handleStatusChange = (
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
  ) => {
    fetcher.submit(
      {
        action: 'updateStatus',
        captureId: capture.id,
        status,
      },
      {
        method: 'POST',
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded px-2 py-1',
                  typeConfig.bgColor,
                )}
              >
                <TypeIcon className={cn('h-4 w-4', typeConfig.color)} />
                <span
                  className={cn(
                    'font-mono text-xs font-bold tracking-wider',
                    typeConfig.color,
                  )}
                >
                  {typeConfig.code}
                </span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded px-2 py-1',
                  statusConfig.bgColor,
                )}
              >
                <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
                <span
                  className={cn(
                    'font-mono text-xs font-medium',
                    statusConfig.color,
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>
            {!isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                편집하기
              </Button>
            )}
          </div>
          <DialogTitle className="sr-only">캡처 상세 정보</DialogTitle>
          <DialogDescription hidden>상세 정보</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              내용
            </label>
            {isEditMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                placeholder="캡처 내용을 입력하세요"
              />
            ) : (
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {capture.content}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              컨텍스트
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                placeholder="컨텍스트를 입력하세요"
              />
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {capture.context || '컨텍스트 없음'}
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Hash className="h-4 w-4" />
              태그
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                placeholder="태그를 쉼표로 구분하여 입력하세요"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {capture.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block rounded bg-neutral-900 px-2 py-1 font-mono text-xs text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Calendar className="h-4 w-4" />
              마감일
            </label>
            {isEditMode ? (
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
              />
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {capture.dueDate
                  ? format(new Date(capture.dueDate), 'yyyy년 MM월 dd일', {
                      locale: ko,
                    })
                  : '마감일 없음'}
              </p>
            )}
          </div>
          {!isEditMode && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                상태 변경
              </label>
              <div className="flex gap-2">
                <Button
                  variant={capture.status === 'PENDING' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('PENDING')}
                  disabled={isUpdating}
                >
                  대기중
                </Button>
                <Button
                  variant={
                    capture.status === 'IN_PROGRESS' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={isUpdating}
                >
                  진행중
                </Button>
                <Button
                  variant={
                    capture.status === 'COMPLETED' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={isUpdating}
                >
                  완료
                </Button>
              </div>
            </div>
          )}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>ID: {capture.id.slice(0, 8)}</span>
              <span>
                생성일:{' '}
                {format(new Date(capture.createdAt), 'yyyy년 MM월 dd일', {
                  locale: ko,
                })}
              </span>
            </div>
          </div>
        </div>
        {isEditMode && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
