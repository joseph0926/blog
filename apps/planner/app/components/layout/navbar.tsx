import { Button } from '@joseph0926/ui/components/button';
import { cn } from '@joseph0926/ui/lib/utils';
import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';
import { navItems } from '@/constants/nav';

type NavbarProps = {
  onQuickCapture?: () => void;
};

export const Navbar = ({ onQuickCapture }: NavbarProps) => {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 hidden border-b backdrop-blur md:block">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold">Planner</h1>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={onQuickCapture}>
          <Plus className="h-4 w-4" />
          Quick Capture
          <kbd className="hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none lg:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </nav>
    </header>
  );
};
