import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { CaptureWithRelations } from '@/types/capture.type';

export function groupCapturesByDate(captures: CaptureWithRelations[]) {
  return captures.reduce(
    (groups, capture) => {
      const date = format(new Date(capture.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(capture);
      return groups;
    },
    {} as Record<string, CaptureWithRelations[]>,
  );
}

export function formatDateHeader(dateStr: string) {
  const date = new Date(dateStr);

  if (isToday(date)) return '오늘';
  if (isYesterday(date)) return '어제';

  return format(date, 'M월 d일 EEEE', { locale: ko });
}
