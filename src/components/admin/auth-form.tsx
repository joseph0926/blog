'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { signin, signup } from '@/actions/auth.action';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authSchema, AuthSchemaType } from '@/schemas/auth.schema';
import { Button } from '../ui/button';

type AuthFormProps = {
  type: 'signin' | 'signup';
};

export const AuthForm = ({ type }: AuthFormProps) => {
  const isSignIn = type === 'signin';

  const router = useRouter();

  const form = useForm<AuthSchemaType>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submitHandler = async (values: AuthSchemaType) => {
    if (isSignIn) {
      const { message, success } = await signin(values);
      if (success) {
        form.reset();
        toast.success(message);
        router.push('/admin');
      } else {
        toast.error(message);
      }
    } else {
      const { success, message } = await signup(values);
      if (success) {
        form.reset();
        toast.success(message);
        router.push('/sign-in');
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="flex w-1/2 flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">
          {isSignIn ? '로그인' : '회원가입'}
        </h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input disabled={form.formState.isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSignIn ? (
            '로그인'
          ) : (
            '회원가입'
          )}
        </Button>
      </form>
    </Form>
  );
};
