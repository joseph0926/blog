import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

type Props = {
  title: string;
  past: string;
  recent: string;
  delta: number;
  children?: ReactNode;
};
export function StoryCard({ title, past, recent, delta, children }: Props) {
  const good = delta < 0;
  return (
    <Card className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground line-through">{past}</span>
        <span
          className={
            good ? 'font-bold text-green-600' : 'font-bold text-red-600'
          }
        >
          {recent}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        7일 전 대비 <strong>{Math.abs(delta).toFixed(0)}%</strong>
        {good ? ' 개선' : ' 악화'}
      </p>
      {children}
    </Card>
  );
}
