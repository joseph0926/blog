import { Button } from '@joseph0926/ui/components/button';
import { Plus } from 'lucide-react';
import { Outlet } from 'react-router';
import { Navbar } from '@/components/layout/navbar';
import { NavbarMobile } from '@/components/layout/navbar-mobile';

export default function RootLayout() {
  return (
    <div>
      <Navbar />
      <NavbarMobile />
      {/* <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Outlet />
      </main>
      <Button
        size="icon"
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button> */}
    </div>
  );
}
