'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import { Calendar } from '@joseph0926/ui/components/calendar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@joseph0926/ui/components/drawer';
import { Label } from '@joseph0926/ui/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@joseph0926/ui/components/popover';
import { Textarea } from '@joseph0926/ui/components/textarea';
import { cn } from '@joseph0926/ui/lib/utils';
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  FileCode2,
  Hash,
  Lightbulb,
  Loader2,
  Package,
  Plus,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';
import type { CaptureType } from '@/generated/prisma/client';
import { CreateCaptureSchema } from '@/schemas/capture.schema';

type QuickCaptureProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const captureTypes: Array<{
  value: CaptureType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    value: 'LEARNING_NEED',
    label: '학습 필요',
    icon: Lightbulb,
    color: 'text-yellow-500',
  },
  {
    value: 'IDEA',
    label: '아이디어',
    icon: Zap,
    color: 'text-purple-500',
  },
  {
    value: 'PR',
    label: 'PR/이슈',
    icon: FileCode2,
    color: 'text-green-500',
  },
  {
    value: 'PROJECT',
    label: '프로젝트',
    icon: Package,
    color: 'text-blue-500',
  },
];

type FormErrors = Partial<
  Record<keyof z.infer<typeof CreateCaptureSchema> | 'tags', string>
>;

export function QuickCapture({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: QuickCaptureProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');
  const [type, setType] = useState<CaptureType>('LEARNING_NEED');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? onOpenChange! : setOpen;

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.state === 'idle' && fetcher.data?.success === true;

  useEffect(() => {
    if (isSuccess && fetcher.data) {
      toast.success('캡처가 저장되었습니다!', {
        description: '타임라인에서 확인할 수 있어요.',
        icon: <CheckCircle className="h-4 w-4" />,
      });

      handleReset();
      setIsOpen(false);

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }

    if (fetcher.state === 'idle' && fetcher.data?.error) {
      toast.error('저장에 실패했습니다', {
        description: fetcher.data.error,
      });
    }
  }, [fetcher.state, fetcher.data, navigate, setIsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (isOpen && e.key === 'Escape' && !isSubmitting) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen, isSubmitting]);

  const validateForm = (): boolean => {
    try {
      const formData = {
        content,
        type,
        context: context || undefined,
        tags: tags.length > 0 ? tags : undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };

      CreateCaptureSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof FormErrors;
          if (path && !formattedErrors[path]) {
            formattedErrors[path] = issue.message;
          }
        });
        setErrors(formattedErrors);

        const firstError = Object.keys(formattedErrors)[0];
        if (firstError === 'content') {
          document.getElementById('content')?.focus();
        }
      }
      return false;
    }
  };

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      toast.error('입력 내용을 확인해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('content', content.trim());
    formData.append('type', type);
    if (context?.trim()) formData.append('context', context.trim());
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
    if (dueDate) formData.append('dueDate', dueDate.toISOString());

    fetcher.submit(formData, {
      method: 'post',
      action: '/api/capture',
    });

    setIsOpen(false);
  }, [content, type, context, tags, dueDate, fetcher]);

  const handleReset = () => {
    setContent('');
    setContext('');
    setType('LEARNING_NEED');
    setTags([]);
    setTagInput('');
    setDueDate(undefined);
    setErrors({});
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) {
      setErrors({ ...errors, tags: '태그를 입력해주세요' });
      return;
    }

    if (tags.includes(trimmedTag)) {
      setErrors({ ...errors, tags: '이미 추가된 태그입니다' });
      return;
    }

    if (tags.length >= 5) {
      setErrors({ ...errors, tags: '태그는 최대 5개까지 추가할 수 있습니다' });
      return;
    }

    if (!/^[a-zA-Z0-9가-힣-_]+$/.test(trimmedTag)) {
      setErrors({
        ...errors,
        tags: '태그는 알파벳, 숫자, 한글, -, _ 만 사용 가능합니다',
      });
      return;
    }

    if (trimmedTag.length > 20) {
      setErrors({ ...errors, tags: '태그는 20자 이내여야 합니다' });
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput('');
    setErrors({ ...errors, tags: undefined });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setErrors({ ...errors, tags: undefined });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="mx-auto !max-h-[90vh] max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Quick Capture</DrawerTitle>
          <DrawerDescription>
            아이디어나 학습이 필요한 내용을 빠르게 기록하세요
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="space-y-4 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">내용 *</Label>
              <span
                className={cn(
                  'text-xs transition-colors',
                  content.length > 450
                    ? 'text-orange-500'
                    : 'text-muted-foreground',
                )}
              >
                {content.length}/500
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) {
                  setErrors({ ...errors, content: undefined });
                }
              }}
              placeholder="무엇을 캡처하시겠어요?"
              className={cn(
                'min-h-[100px] resize-none transition-colors',
                errors.content && 'border-destructive focus:ring-destructive',
              )}
              autoFocus
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-destructive animate-in slide-in-from-top-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.content}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>타입</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {captureTypes.map((captureType) => {
                const Icon = captureType.icon;
                return (
                  <button
                    key={captureType.value}
                    type="button"
                    onClick={() => setType(captureType.value)}
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border p-2 text-sm transition-all duration-200',
                      type === captureType.value
                        ? 'border-primary bg-primary/10 scale-[1.02] shadow-sm'
                        : 'border-border hover:bg-accent hover:scale-[1.02]',
                      isSubmitting && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        captureType.color,
                      )}
                    />
                    <span>{captureType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="context">컨텍스트 (선택)</Label>
              {context && (
                <span
                  className={cn(
                    'text-xs transition-colors',
                    context.length > 180
                      ? 'text-orange-500'
                      : 'text-muted-foreground',
                  )}
                >
                  {context.length}/200
                </span>
              )}
            </div>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                if (errors.context) {
                  setErrors({ ...errors, context: undefined });
                }
              }}
              placeholder="어떤 상황에서 이 생각이 떠올랐나요?"
              className={cn(
                'min-h-[60px] resize-none transition-colors',
                errors.context && 'border-destructive focus:ring-destructive',
              )}
              disabled={isSubmitting}
            />
            {errors.context && (
              <p className="text-destructive animate-in slide-in-from-top-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.context}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">태그 ({tags.length}/5)</Label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그 입력 후 Enter"
                className={cn(
                  'border-input h-9 flex-1 rounded-md border bg-transparent px-3 text-sm transition-colors',
                  errors.tags && 'border-destructive focus:ring-destructive',
                )}
                disabled={isSubmitting || tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={isSubmitting || tags.length >= 5}
              >
                추가
              </Button>
            </div>
            {errors.tags && (
              <p className="text-destructive animate-in slide-in-from-top-1 flex items-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {errors.tags}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      'hover:bg-destructive/20 cursor-pointer transition-all hover:scale-105',
                      isSubmitting && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={() => !isSubmitting && handleRemoveTag(tag)}
                  >
                    <Hash className="mr-1 h-3 w-3" />
                    {tag}
                    <span className="ml-1 text-xs opacity-60">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="dueDate">언제 할 일인가요? (선택)</Label>
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate(undefined)}
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                >
                  날짜 초기화
                </Button>
              )}
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground',
                    isSubmitting && 'cursor-not-allowed opacity-50',
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    dueDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    <span>날짜 선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </form>
        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1 transition-all hover:scale-[1.02]"
            >
              취소
              <kbd className="bg-muted ml-2 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-60 sm:inline-flex">
                ESC
              </kbd>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="flex-1 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  캡처 저장
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
