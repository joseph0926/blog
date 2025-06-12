'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { updatePost } from '@/actions/post.action';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  async function handleChange(files: File[]) {
    if (!files.length) return;
    try {
      setLoading(true);
      const url = await uploadImage(files[0]);
      await updatePost(post.slug, { thumbnail: url });
      onUploaded(url);
      toast.success('썸네일이 저장되었습니다.');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('업로드 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{post.title} 썸네일 업로드</DialogTitle>
        </DialogHeader>

        <FileUpload onChange={handleChange} />

        <Button
          disabled={loading}
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
