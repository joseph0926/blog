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

export const Footer = async ({ size = 'lg', locale }: FooterProps) => {
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });
  const currentYear = new Date().getFullYear();

  const navbarItems = [
    { href: '/blog', label: tNav('blog') },
    { href: '/about', label: tNav('about') },
  ];

  return (
    <footer className="border-border mt-auto border-t">
      <Container size={size} className="py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-4">
            <p className="text-foreground text-sm font-medium">joseph0926</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              {tFooter('description')}
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <nav className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
              >
                {tNav('home')}
              </Link>
              {navbarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={
                    link.href.startsWith('mailto')
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-2 transition-colors duration-150"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border/50 mt-8 border-t pt-8">
          <p className="text-muted-foreground text-center text-xs">
            &copy; {currentYear} joseph0926. {tFooter('rights')}
          </p>
        </div>
      </Container>
    </footer>
  );
};
