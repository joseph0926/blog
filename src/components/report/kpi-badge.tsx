import { cn } from '@/lib/utils';

type Props = {
  label: string;
  delta: number;
};

export function KpiBadge({ label, delta }: Props) {
  const good = delta < 0;
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center rounded-md px-3 py-2',
        good ? 'bg-green-600/10 text-green-600' : 'bg-red-600/10 text-red-600',
      )}
      aria-label={`${label} ${Math.abs(delta).toFixed(0)}퍼센트 ${good ? '개선' : '악화'}`}
    >
      <span className="text-2xl leading-none font-bold">
        {delta > 0 && '+'}
        {delta.toFixed(0)}%
      </span>
      <span className="mt-1 text-xs">{label}</span>
    </div>
  );
}
