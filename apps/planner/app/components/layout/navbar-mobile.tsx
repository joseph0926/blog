import { Button } from '@joseph0926/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@joseph0926/ui/components/sheet';
import { cn } from '@joseph0926/ui/lib/utils';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { navItems } from '@/constants/nav';

export const NavbarMobile = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 border-b backdrop-blur md:hidden">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <h1 className="font-semibold">Planner</h1>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader hidden>
              <SheetTitle>Planner</SheetTitle>
              <SheetDescription>Planner Navbar</SheetDescription>
            </SheetHeader>
            <nav className="mx-4 mt-20 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
