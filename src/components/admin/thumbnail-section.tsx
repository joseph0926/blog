'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { uploadImage } from '@/lib/upload';
import { FileUpload } from '../ui/file-upload';

export default function ThumbnailDialog({
  post,
  onClose,
  onUploaded,
}: {
  post: { slug: string; title: string };
  onClose: () => void;
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const updatePostMutation = trpc.post.update.useMutation({
    onSuccess: (data) => {
      onUploaded(data.post.thumbnail);
      toast.success(data.message);
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || '업로드 실패');
    },
  });

  async function handleChange(files: File[]) {
    if (!files.length) return;
    try {
      setLoading(true);
      const url = await uploadImage(files[0]);

      updatePostMutation.mutate({
        slug: post.slug,
        payload: { thumbnail: url },
      });
    } catch (e) {
      console.error(e);
      toast.error('이미지 업로드 실패');
    } finally {
      setLoading(false);
    }
  }

  const isLoading = loading || updatePostMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{post.title} 썸네일 업로드</DialogTitle>
        </DialogHeader>
        <FileUpload onChange={handleChange} />
        <Button
          disabled={isLoading}
          onClick={onClose}
          className="mt-4 w-full"
          variant="outline"
        >
          닫기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
