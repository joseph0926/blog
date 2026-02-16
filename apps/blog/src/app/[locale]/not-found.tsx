import { Button } from '@joseph0926/ui/components/button';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-8xl font-bold">404</h1>
        <h2 className="text-foreground mb-4 text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mb-6 text-lg">{t('description')}</p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">{t('goHome')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/blog">{t('goBlog')}</Link>
        </Button>
      </div>
    </div>
  );
}
