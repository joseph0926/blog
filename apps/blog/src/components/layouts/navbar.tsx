'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@joseph0926/ui/components/sheet';
import { cn } from '@joseph0926/ui/lib/utils';
import { Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { LogoIcon } from '../ui/icons';
import { ThemeToggle } from '../ui/theme-toggle';
import { LocaleSwitcher } from './locale-switcher';

export const Navbar = () => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navbarItems = [
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 flex h-14 w-full items-center justify-between transition-all duration-150',
        isScrolled
          ? 'border-border/40 bg-background/80 border-b backdrop-blur-md'
          : 'bg-background',
      )}
      aria-label={t('mainNavigation')}
    >
      <Link href="/" aria-label={t('home')}>
        <LogoIcon textColor="var(--foreground)" />
      </Link>

      <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
        {navbarItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="group relative py-1 transition-colors duration-150"
            >
              <span
                className={cn(
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </span>
              {isActive(item.href) && (
                <motion.span
                  layoutId="navbar-underline"
                  className="bg-foreground absolute -bottom-0.5 left-0 h-0.5 w-full"
                />
              )}
            </Link>
          </li>
        ))}
        <li className="ml-2">
          <LocaleSwitcher />
        </li>
        <li className="ml-2">
          <ThemeToggle />
        </li>
      </ul>

      <div className="flex items-center gap-2 md:hidden">
        <LocaleSwitcher />
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="hover:bg-muted rounded-md p-2 transition-colors duration-100"
            aria-label={t('openMenu')}
            aria-expanded={isOpen}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>{t('menu')}</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navbarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-4 py-3 text-base font-medium transition-colors duration-100',
                    isActive(item.href)
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
