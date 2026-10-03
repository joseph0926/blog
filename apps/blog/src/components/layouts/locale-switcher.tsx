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
      className="inline-flex items-center gap-0.5"
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
            'press h-8 rounded-[4px] px-2 text-[13px] font-medium',
            locale === item
              ? 'text-foreground bg-muted hover:bg-muted'
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
