import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/admin/logout-button';
import { getAdminCookie } from '@/lib/auth/cookie';
import { verifyAccessToken } from '@/lib/auth/token';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAdminCookie();

  if (!token) {
    redirect('/login');
  }

  try {
    await verifyAccessToken(token);
  } catch {
    redirect('/login');
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
