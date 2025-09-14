'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@joseph0926/ui/components/alert';
import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@joseph0926/ui/components/form';
import { Input } from '@joseph0926/ui/components/input';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';

const loginSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: '',
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      router.push('/admin');
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-primary/10 rounded-full p-3">
              <Lock className="text-primary h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Admin 로그인</CardTitle>
          <CardDescription className="text-center">
            관리자 비밀번호를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
