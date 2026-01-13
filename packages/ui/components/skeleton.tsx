import { cn } from '@joseph0926/ui/lib/utils';

type SkeletonProps = React.ComponentProps<'div'> & {
  shimmer?: boolean;
};

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md',
        shimmer ? 'skeleton-shimmer' : 'bg-accent animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
