import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HeaderFilters } from './header-filters';

export function ReportNavbar() {
  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
      <SidebarTrigger className="shrink-0 cursor-pointer" />
      <h1 className="text-lg font-semibold tracking-tight">Report</h1>
      <div className="ml-auto flex items-center gap-2">
        <Suspense
          fallback={
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          }
        >
          <HeaderFilters />
        </Suspense>
        <ThemeToggle />
      </div>
    </nav>
  );
}
