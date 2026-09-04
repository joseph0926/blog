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
      className="border-rule inline-flex items-center gap-0.5 rounded-sm border p-0.5"
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
            'press h-6 rounded-[2px] px-2 font-mono text-[11px] font-medium',
            locale === item
              ? 'bg-foreground text-background hover:bg-foreground hover:text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={locale === item}
        >
          <span className="sr-only">{item === 'ko' ? t('ko') : t('en')}</span>
          <span aria-hidden="true">{item === 'ko' ? 'KO' : 'EN'}</span>
        </Button>
      ))}
    </div>
  );
}
