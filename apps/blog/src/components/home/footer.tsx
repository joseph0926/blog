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
    { href: '/', label: tNav('home') },
    { href: '/blog', label: tNav('blog') },
    { href: '/about', label: tNav('about') },
  ];
  const topics = ['React', 'TypeScript', 'Performance', 'Tooling'];

  return (
    <footer className="border-border/70 mt-auto border-t">
      <Container size={size} className="py-10 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-foreground text-sm font-semibold">joseph0926</p>
            <p className="text-muted-foreground max-w-sm text-sm leading-6">
              {tFooter('description')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
              {tFooter('navigation')}
            </p>
            <nav className="flex flex-col gap-2">
              {navbarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-muted-foreground text-sm transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
              {tFooter('topics')}
            </p>
            <ul className="flex flex-col gap-2">
              {topics.map((topic) => (
                <li key={topic} className="text-foreground text-sm">
                  {topic}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
              {tFooter('elsewhere')}
            </p>
            <div className="flex items-center gap-2">
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
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring rounded-md p-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-10 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {currentYear} joseph0926. {tFooter('rights')}
          </p>
          <p>{tFooter('builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
};
