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
  const brandName = tFooter('brandName');

  const navbarItems = [
    { href: '/', label: tNav('home') },
    { href: '/blog', label: tNav('blog') },
    { href: '/about', label: tNav('about') },
  ];
  const topics = ['React', 'TypeScript', 'Performance', 'Tooling'];

  return (
    <footer className="border-border/70 mt-auto border-t">
      <Container size={size} className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-foreground inline-flex items-center gap-2 text-sm font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2]" />
              {brandName}
            </p>
            <p className="text-muted-foreground max-w-sm text-sm leading-6">
              {tFooter('description')}
            </p>
            <div className="flex items-center gap-1">
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
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring -ml-2 rounded-md p-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-4 font-mono text-[10px] tracking-wider uppercase">
              {tFooter('navigation')}
            </p>
            <nav className="flex flex-col gap-2.5">
              {navbarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground text-sm transition-colors duration-150 hover:text-[#5e6ad2]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-muted-foreground mb-4 font-mono text-[10px] tracking-wider uppercase">
              {tFooter('topics')}
            </p>
            <ul className="flex flex-col gap-2.5">
              {topics.map((topic) => (
                <li
                  key={topic}
                  className="text-foreground flex items-center gap-2 text-sm"
                >
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]/70" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-muted-foreground mb-4 font-mono text-[10px] tracking-wider uppercase">
              {tFooter('elsewhere')}
            </p>
            <nav className="flex flex-col gap-2.5">
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
                  className="text-foreground text-sm transition-colors duration-150 hover:text-[#5e6ad2]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-12 flex flex-col gap-3 border-t pt-6 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {currentYear} {brandName}. {tFooter('rights')}
          </p>
          <p>{tFooter('builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
};
