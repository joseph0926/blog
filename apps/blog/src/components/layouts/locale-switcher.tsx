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
      className="border-border/60 bg-muted/40 inline-flex items-center gap-1 rounded-full border p-1"
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
            'h-7 rounded-full px-2 text-[11px] font-medium',
            locale === item
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground',
          )}
          aria-pressed={locale === item}
        >
          {item === 'ko' ? t('ko') : t('en')}
        </Button>
      ))}
    </div>
  );
}
