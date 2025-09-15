import { cn } from '@joseph0926/ui/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { CaptureWithRelations } from '@/types/capture.type';
import { CaptureDetailModal } from './capture-detail-modal';

type CaptureCardProps = {
  capture: CaptureWithRelations;
  isOptimistic?: boolean;
};

export const CaptureCard = ({
  capture,
  isOptimistic = false,
}: CaptureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetcher = useFetcher();

  const isDeleting =
    fetcher.state !== 'idle' && fetcher.formData?.get('action') === 'delete';

  const handleDelete = () => {
    fetcher.submit(
      {
        action: 'delete',
        captureId: capture.id,
      },
      {
        method: 'POST',
      },
    );
  };

  const StatusIcon = {
    PENDING: Circle,
    IN_PROGRESS: Clock,
    COMPLETED: CheckCircle2,
  }[capture.status];

  const typeConfig = {
    LEARNING_NEED: {
      code: 'LRN',
      priority: 'MEDIUM',
      color: 'text-amber-500 dark:text-amber-400',
      bgGlow: 'bg-amber-500/10',
      icon: Target,
    },
    IDEA: {
      code: 'IDX',
      priority: 'LOW',
      color: 'text-purple-500 dark:text-purple-400',
      bgGlow: 'bg-purple-500/10',
      icon: Zap,
    },
    PR: {
      code: 'PRX',
      priority: 'HIGH',
      color: 'text-emerald-500 dark:text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      icon: AlertTriangle,
    },
    PROJECT: {
      code: 'PRJ',
      priority: 'CRITICAL',
      color: 'text-red-500 dark:text-red-400',
      bgGlow: 'bg-red-500/10',
      icon: AlertTriangle,
    },
  }[capture.type];

  const statusConfig = {
    PENDING: {
      label: '대기',
      color: 'text-neutral-500 dark:text-neutral-400',
      bg: 'bg-neutral-500/10',
      pulse: false,
    },
    IN_PROGRESS: {
      label: '활성',
      color: 'text-cyan-500 dark:text-cyan-400',
      bg: 'bg-cyan-500/10',
      pulse: true,
    },
    COMPLETED: {
      label: '완료',
      color: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-500/10',
      pulse: false,
    },
  }[capture.status];

  const TypeIcon = typeConfig.icon;

  return (
    <>
      <div
        className={cn(
          'group relative cursor-pointer',
          'border-l-[3px]',
          capture.status === 'IN_PROGRESS'
            ? 'border-l-cyan-500 dark:border-l-cyan-400'
            : 'border-l-neutral-300 dark:border-l-neutral-700',
          'transition-all duration-300',
          isHovered && 'border-l-cyan-400 dark:border-l-cyan-300',
          isOptimistic && 'animate-pulse opacity-70',
          isDeleting && 'scale-95 opacity-50',
        )}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            'relative',
            'bg-gradient-to-r from-neutral-50/50 via-transparent to-transparent',
            'dark:from-neutral-900/20 dark:via-transparent dark:to-transparent',
            'transition-all duration-300',
            isHovered && 'from-neutral-100/70 dark:from-neutral-900/40',
          )}
        >
          <div className="py-3 pr-4 pl-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={cn(
                      'relative flex items-center gap-1.5 rounded px-2 py-0.5',
                      'bg-black/5 dark:bg-white/5',
                      'border border-neutral-200 dark:border-neutral-800',
                      'transition-all duration-300',
                      isHovered && 'bg-black/10 dark:bg-white/10',
                    )}
                  >
                    <TypeIcon className={cn('h-3 w-3', typeConfig.color)} />
                    <span
                      className={cn(
                        'font-mono text-[10px] font-bold tracking-wider',
                        typeConfig.color,
                      )}
                    >
                      {typeConfig.code}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                  <span className="font-mono text-[10px] text-neutral-500 uppercase dark:text-neutral-400">
                    ID: {capture.id.slice(0, 8)}
                  </span>
                  <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                  <div
                    className={cn(
                      'flex items-center gap-1.5 rounded px-2 py-0.5',
                      statusConfig.bg,
                      'transition-all duration-300',
                    )}
                  >
                    <StatusIcon
                      className={cn(
                        'h-3 w-3',
                        statusConfig.color,
                        statusConfig.pulse && 'animate-pulse',
                      )}
                    />
                    <span
                      className={cn(
                        'font-mono text-[10px] font-medium tracking-wider',
                        statusConfig.color,
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  {isOptimistic && (
                    <div className="flex items-center gap-1.5 rounded bg-blue-500/10 px-2 py-0.5">
                      <Activity className="h-3 w-3 animate-pulse text-blue-500" />
                      <span className="font-mono text-[10px] tracking-wider text-blue-500 uppercase">
                        TX
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    'relative overflow-hidden',
                    'max-h-[60px] transition-all duration-300',
                    isHovered && 'max-h-[120px]',
                  )}
                >
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      'text-neutral-700 dark:text-neutral-300',
                      'transition-colors duration-300',
                      isHovered && 'text-neutral-900 dark:text-neutral-100',
                    )}
                  >
                    {capture.content}
                  </p>
                </div>
                {capture.context && (
                  <div
                    className={cn(
                      'mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-800',
                      'transition-all duration-300',
                      isHovered ? 'opacity-100' : 'opacity-40',
                    )}
                  >
                    <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="text-[10px] tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                        CTX:
                      </span>
                      <span className="ml-2 font-sans">{capture.context}</span>
                    </p>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {capture.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={cn(
                          'inline-block px-1.5 py-0.5',
                          'font-mono text-[10px] uppercase',
                          'bg-neutral-900 dark:bg-neutral-100',
                          'text-neutral-100 dark:text-neutral-900',
                          'transition-all duration-300',
                          isHovered && 'bg-cyan-500 dark:bg-cyan-400',
                        )}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  {capture._count.notes > 0 && (
                    <>
                      <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
                      <span className="font-mono text-[10px] text-neutral-500 uppercase dark:text-neutral-400">
                        정보: {capture._count.notes}
                      </span>
                    </>
                  )}
                  {capture.dueDate && (
                    <>
                      <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                        <span className="font-mono text-[10px] text-neutral-500 uppercase dark:text-neutral-400">
                          {format(new Date(capture.dueDate), 'MM/dd', {
                            locale: ko,
                          })}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <time className="font-mono text-[10px] text-neutral-400 uppercase dark:text-neutral-500">
                      T-
                      {formatDistanceToNow(new Date(capture.createdAt), {
                        addSuffix: false,
                        locale: ko,
                      })}
                    </time>
                    {isHovered && !isOptimistic && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={isDeleting}
                        className={cn(
                          'group/delete flex cursor-pointer items-center gap-1 rounded px-2 py-1',
                          'bg-red-500/10 hover:bg-red-500/20',
                          'transition-all duration-200',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                        aria-label="캡처 삭제"
                      >
                        <Trash2 className="h-3 w-3 text-red-500 transition-transform group-hover/delete:scale-110" />
                        <span className="font-mono text-[10px] text-red-500 uppercase">
                          {isDeleting ? '삭제 중...' : '삭제'}
                        </span>
                      </button>
                    )}
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 transition-all duration-300',
                        isHovered
                          ? 'translate-x-1 text-cyan-500'
                          : 'text-neutral-400 dark:text-neutral-600',
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-px',
              'bg-gradient-to-r from-transparent via-neutral-200 to-transparent',
              'dark:via-neutral-800',
              'transition-all duration-300',
              isHovered && 'via-cyan-500/30 dark:via-cyan-400/30',
            )}
          />
          {isHovered && (
            <div className="pointer-events-none absolute inset-0">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 w-1',
                  'bg-gradient-to-b from-transparent via-cyan-400 to-transparent',
                  'animate-pulse opacity-50',
                )}
              />
            </div>
          )}
        </div>
      </div>
      <CaptureDetailModal
        capture={capture}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
