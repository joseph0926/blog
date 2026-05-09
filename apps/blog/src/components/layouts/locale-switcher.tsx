'use client';

import { Button } from '@joseph0926/ui/components/button';
import { cn } from '@joseph0926/ui/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

const locales: AppLocale[] = ['ko', 'en'];

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('localeSwitcher');

  const handleLocaleChange = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale, scroll: false });
  };

  return (
    <div
      className="border-border/70 bg-background inline-flex items-center gap-0.5 rounded-md border p-0.5"
      role="group"
      aria-label={t('label')}
    >
      {locales.map((item) => (
        <Button
          key={item}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleLocaleChange(item)}
          className={cn(
            'h-7 rounded-sm px-2 font-mono text-[11px] font-medium tracking-normal tabular-nums',
            locale === item
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={locale === item}
        >
          <span className="sr-only">{item === 'ko' ? t('ko') : t('en')}</span>
          <span aria-hidden="true">{item.toUpperCase()}</span>
        </Button>
      ))}
    </div>
  );
}
