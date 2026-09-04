'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@joseph0926/ui/components/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
  const { setTheme } = useTheme();
  const t = useTranslations('nav');

  const options = [
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
    { value: 'system', label: t('themeSystem') },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button
          variant="ghost"
          size="icon"
          className="press text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-[1.1rem] w-[1.1rem] dark:hidden" />
          <Moon className="hidden h-[1.1rem] w-[1.1rem] dark:block" />
          <span className="sr-only">{t('themeToggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-rule min-w-32">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
