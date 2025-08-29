'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  description: z.string().min(1, '설명을 입력해주세요'),
  tags: z.array(z.string()).min(1, '최소 하나의 태그를 선택해주세요'),
  thumbnail: z.string().optional(),
});

type Post = {
  description: string;
  title: string;
  tags: {
    id: string;
    name: string;
  }[];
  thumbnail: string | null;
  slug: string;
  id: string;
  createdAt: Date;
};

type PostFormData = z.infer<typeof postSchema>;

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  post?: Post;
  onSuccess?: () => void;
}

export function PostDialog({
  open,
  onOpenChange,
  mode,
  post,
  onSuccess,
}: PostDialogProps) {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      thumbnail: '',
    },
  });

  const { data: tagsData } = trpc.post.getTags.useQuery();
  const tagOptions = tagsData?.tags.map((tag) => tag.name) || [];

  useEffect(() => {
    if (mode === 'edit' && post) {
      form.reset({
        title: post.title,
        description: post.description,
        tags: post.tags.map((t) => t.name),
        thumbnail: post.thumbnail || '',
      });
    }
  }, [mode, post, form]);

  const createMutation = trpc.post.createPost.useMutation({
    onSuccess: () => {
      toast.success('게시글이 생성되었습니다.');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.post.update.useMutation({
    onSuccess: () => {
      toast.success('게시글이 수정되었습니다.');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: PostFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (mode === 'edit' && post) {
      updateMutation.mutate({
        slug: post.slug,
        payload: data,
      });
    } else {
      console.error('Edit mode but no post data');
      toast.error('수정할 게시글 정보가 없습니다.');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '새 게시글 작성' : '게시글 수정'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? '새로운 게시글을 작성합니다.'
              : '게시글 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="게시글 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="게시글 설명"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>태그</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tagOptions}
                      values={field.value}
                      onChange={field.onChange}
                      placeholder="태그 선택"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>썸네일 URL (선택)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '처리중...' : mode === 'create' ? '생성' : '수정'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
