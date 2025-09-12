'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@joseph0926/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@joseph0926/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@joseph0926/ui/components/form';
import { Input } from '@joseph0926/ui/components/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@joseph0926/ui/components/tabs';
import { Textarea } from '@joseph0926/ui/components/textarea';
import { Link, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FileUpload } from '@/components/ui/file-upload';
import { MultiSelect } from '@/components/ui/multi-select';
import { trpc } from '@/lib/trpc';
import { uploadImage } from '@/lib/upload';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');

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
      setThumbnailPreview(post.thumbnail || '');
      setUrlInput(post.thumbnail || '');
    } else if (mode === 'create') {
      form.reset({
        title: '',
        description: '',
        tags: [],
        thumbnail: '',
      });
      setThumbnailPreview('');
      setUrlInput('');
    }
  }, [mode, post, form]);

  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(files[0]);
      form.setValue('thumbnail', url);
      setThumbnailPreview(url);
      setUrlInput(url);
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput) {
      toast.error('URL을 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(urlInput);
      form.setValue('thumbnail', urlInput);
      setThumbnailPreview(urlInput);
      toast.success('썸네일 URL이 설정되었습니다.');
    } catch {
      toast.error('올바른 URL 형식이 아닙니다.');
    }
  };

  const removeThumbnail = () => {
    form.setValue('thumbnail', '');
    setThumbnailPreview('');
    setUrlInput('');
  };

  const createMutation = trpc.post.createPost.useMutation({
    onSuccess: () => {
      toast.success('게시글이 생성되었습니다.');
      form.reset();
      setThumbnailPreview('');
      setUrlInput('');
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

  const isLoading =
    createMutation.isPending || updateMutation.isPending || uploadingImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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
              render={() => (
                <FormItem>
                  <FormLabel>썸네일 이미지</FormLabel>
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        className="h-48 w-full rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeThumbnail}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">
                          <Upload className="mr-2 h-4 w-4" />
                          파일 업로드
                        </TabsTrigger>
                        <TabsTrigger value="url">
                          <Link className="mr-2 h-4 w-4" />
                          URL 입력
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="mt-4">
                        <FileUpload
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        {uploadingImage && (
                          <p className="text-muted-foreground mt-2 text-sm">
                            이미지 업로드 중...
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="url" className="mt-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUrlSubmit();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput}
                          >
                            확인
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}

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
