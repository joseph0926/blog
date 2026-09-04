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
import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { ThemeToggle } from '../ui/theme-toggle';
import { LocaleSwitcher } from './locale-switcher';

export const Navbar = () => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
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
      className="flex h-14 w-full items-center justify-between"
      aria-label={t('mainNavigation')}
    >
      <Link
        href="/"
        className="focus-visible:ring-ring -ml-2 inline-flex items-baseline gap-2 rounded-sm px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="text-foreground text-[15px] font-semibold tracking-tight">
          {t('brandName')}
        </span>
        <span className="text-muted-foreground hidden text-xs sm:inline">
          {t('tagline')}
        </span>
      </Link>

      <ul className="hidden items-center gap-1 text-sm md:flex">
        {navbarItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'focus-visible:ring-ring relative inline-flex h-9 items-center rounded-sm px-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                isActive(item.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="navbar-underline"
                  className="bg-accent-ink absolute right-3 bottom-1 left-3 h-0.5"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'tween', duration: 0.18, ease: 'easeOut' }
                  }
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

      <div className="flex items-center gap-1 md:hidden">
        <LocaleSwitcher />
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="press text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm p-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
            aria-label={t('openMenu')}
            aria-expanded={isOpen}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="border-rule w-72">
            <SheetHeader>
              <SheetTitle className="text-sm font-medium">
                {t('menu')}
              </SheetTitle>
            </SheetHeader>
            <ul className="mt-2 flex flex-col">
              {navbarItems.map((item) => (
                <li key={item.href} className="border-rule border-t">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 text-base transition-colors duration-150',
                      isActive(item.href)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-0.5 w-3',
                        isActive(item.href) ? 'bg-accent-ink' : 'bg-rule',
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
