import Link from 'next/link';
import { navbarItems } from '@/constants/navbar';
import { LogoIcon } from '../ui/icons';
import { ThemeToggle } from '../ui/theme-toggle';

export const Navbar = () => {
  return (
    <nav className="flex h-14 w-full items-center justify-between">
      <Link href="/">
        <LogoIcon textColor="var(--foreground)" />
      </Link>
      <ul className="flex items-center gap-6 text-sm font-medium">
        {navbarItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
        <ThemeToggle />
      </ul>
    </nav>
  );
};
