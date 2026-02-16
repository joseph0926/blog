'use client';

import { Button } from '@joseph0926/ui/components/button';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-4xl font-bold">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mb-4 text-lg">{t('description')}</p>
        {error.digest && (
          <p className="text-muted-foreground/60 mb-4 font-mono text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          {t('retry')}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{t('goHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
