import { Github, Linkedin, Mail } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { INFO } from '@/constants/info';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { Container } from '../ui/container';

type FooterProps = {
  size?: 'sm' | 'md' | 'lg';
  locale: AppLocale;
};

const socialLinks = [
  { href: INFO.GITHUB, label: 'GitHub', icon: Github },
  { href: INFO.LINKEDIN, label: 'LinkedIn', icon: Linkedin },
  { href: 'mailto:joseph0926@kakao.com', label: 'Email', icon: Mail },
];

const linkClass =
  'text-foreground hover:text-accent-ink focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

export const Footer = async ({ size = 'lg', locale }: FooterProps) => {
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });
  const currentYear = new Date().getFullYear();
  const brandName = tFooter('brandName');

  const navbarItems = [
    { href: '/', label: tNav('home') },
    { href: '/blog', label: tNav('blog') },
    { href: '/about', label: tNav('about') },
  ];

  return (
    <footer className="border-rule mt-auto border-t">
      <Container size={size} className="py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="max-w-sm space-y-3">
            <p className="text-foreground text-sm font-semibold">
              {brandName}
              <span className="text-muted-foreground ml-2 font-normal">
                {tNav('tagline')}
              </span>
            </p>
            <p className="text-muted-foreground text-sm leading-6">
              {tFooter('description')}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-3 text-xs">
                {tFooter('navigation')}
              </p>
              <nav className="flex flex-col gap-2">
                {navbarItems.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-muted-foreground mb-3 text-xs">
                {tFooter('elsewhere')}
              </p>
              <nav className="flex flex-col gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={
                      link.href.startsWith('mailto') ? undefined : '_blank'
                    }
                    rel={
                      link.href.startsWith('mailto')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                    className={linkClass}
                  >
                    <link.icon className="text-muted-foreground h-3.5 w-3.5" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="border-rule text-muted-foreground mt-12 flex flex-col gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-mono tabular-nums">&copy; {currentYear}</span>{' '}
            {brandName}. {tFooter('rights')}
          </p>
          <p>{tFooter('builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
};
