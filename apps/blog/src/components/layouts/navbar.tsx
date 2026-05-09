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
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { ThemeToggle } from '../ui/theme-toggle';
import { LocaleSwitcher } from './locale-switcher';

export const Navbar = () => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navbarItems = [
    { href: '/', label: t('home') },
    { href: '/blog', label: t('blog') },
    { href: '/about', label: t('about') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="flex h-16 w-full items-center justify-between"
      aria-label={t('mainNavigation')}
    >
      <Link
        href="/"
        aria-label={t('home')}
        className="focus-visible:ring-ring -ml-2 inline-flex items-center rounded-md px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="text-foreground text-sm font-semibold tracking-tight">
          joseph0926
        </span>
      </Link>

      <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
        {navbarItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="group hover:bg-muted/70 relative inline-flex h-9 items-center rounded-md px-3 transition-colors duration-150"
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
                  className="bg-foreground absolute right-3 bottom-1.5 left-3 h-px"
                  transition={{ type: 'tween', duration: 0.18 }}
                />
              )}
            </Link>
          </li>
        ))}
        <li className="ml-4">
          <LocaleSwitcher />
        </li>
        <li>
          <ThemeToggle />
        </li>
      </ul>

      <div className="flex items-center gap-2 md:hidden">
        <LocaleSwitcher />
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="hover:bg-muted focus-visible:ring-ring rounded-md p-2 transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
                    'rounded-md px-4 py-3 text-base font-medium transition-colors duration-100',
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
