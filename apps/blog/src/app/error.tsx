'use client';

import { Button } from '@joseph0926/ui/components/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-4xl font-bold">
          문제가 발생했습니다
        </h1>
        <p className="text-muted-foreground mb-4 text-lg">
          예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/60 mb-4 font-mono text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          다시 시도
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로 이동</Link>
        </Button>
      </div>
    </div>
  );
}
