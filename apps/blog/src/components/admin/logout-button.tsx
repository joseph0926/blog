'use client';

import { Button } from '@joseph0926/ui/components/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export function LogoutButton() {
  const router = useRouter();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/admin/login');
      router.refresh();
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      로그아웃
    </Button>
  );
}
