import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

export const BlogFilterSkeleton = () => {
  return (
    <div className="fixed top-14 left-4 z-10 h-3/4 w-44 p-2">
      <div className="hidden flex-col gap-10 xl:flex">
        <div className="flex flex-col gap-4">
          <Label>Search</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Label>Category</Label>
          <ul className="flex flex-col gap-2.5">
            {Array.from({ length: 3 })?.map((_, idx) => (
              <li key={idx}>
                <Skeleton className="h-8 w-full" />
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="outline"
          className="border-destructive text-destructive cursor-pointer"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
