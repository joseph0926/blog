'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PostResponse } from '@/types/post.type';
import ThumbnailDialog from './thumbnail-section';

type Post = {
  slug: string;
  title: string;
  createdAt: Date;
  thumbnail: string | null;
};

export default function PostsTable({
  initialPosts,
}: {
  initialPosts: PostResponse[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [selected, setSelected] = useState<Post | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead className="w-40">작성일</TableHead>
            <TableHead className="w-40">썸네일</TableHead>
            <TableHead className="w-32 text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.slug}>
              <TableCell className="max-w-xs truncate">{p.title}</TableCell>
              <TableCell>
                {new Date(p.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {p.thumbnail ? (
                  <Image
                    src={p.thumbnail}
                    width={64}
                    height={40}
                    alt="thumbnail"
                    className="h-10 w-16 rounded object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">없음</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => setSelected(p)}>
                  편집
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && (
        <ThumbnailDialog
          post={selected}
          onClose={() => setSelected(null)}
          onUploaded={(url) =>
            setPosts((prev) =>
              prev.map((p) =>
                p.slug === selected.slug ? { ...p, thumbnail: url } : p,
              ),
            )
          }
        />
      )}
    </>
  );
}
