'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { PostDialog } from './post-dialog';

type PostsTableProps = {
  searchQuery: string;
};

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

export function PostsTable({ searchQuery }: PostsTableProps) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const { data, isLoading, refetch } = trpc.post.getPosts.useQuery({
    limit: 100,
  });

  const filteredPosts =
    data?.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="hidden md:table-cell">설명</TableHead>
              <TableHead className="hidden sm:table-cell">태그</TableHead>
              <TableHead className="hidden lg:table-cell">생성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post, index) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {post.title}
                  </TableCell>
                  <TableCell className="hidden max-w-[300px] truncate md:table-cell">
                    {post.description}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(post.createdAt), 'PPP', { locale: ko })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/post/${post.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            보기
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingPost(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {editingPost && (
        <PostDialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
          mode="edit"
          post={editingPost}
          onSuccess={() => {
            setEditingPost(null);
            refetch();
          }}
        />
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>제목</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>태그</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
