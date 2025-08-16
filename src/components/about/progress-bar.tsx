'use client';

interface ProgressBarProps {
  progress: number;
  label: string;
}

export const ProgressBar = ({ progress, label }: ProgressBarProps) => {
  const barLength = 15;

  return (
    <div className="font-mono text-xs sm:text-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-muted-foreground break-words">{label}</span>
      </div>
      <div className="flex items-center gap-1 overflow-hidden sm:gap-2">
        <span className="text-chart-2 dark:text-chart-2 flex-shrink-0">[</span>
        <div className="flex min-w-0">
          {[...Array(barLength)].map((_, i) => (
            <span
              key={i}
              className={`text-xs sm:text-sm ${
                i < Math.floor(progress * barLength)
                  ? 'text-chart-2 dark:text-chart-2'
                  : 'text-secondary'
              }`}
            >
              {i < Math.floor(progress * barLength) ? '=' : '-'}
            </span>
          ))}
        </div>
        <span className="text-chart-2 dark:text-chart-2 flex-shrink-0">]</span>
        <span className="text-muted-foreground ml-1 flex-shrink-0 sm:ml-2">
          {Math.floor(progress * 100)}%
        </span>
      </div>
    </div>
  );
};
