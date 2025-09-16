import { notFound, redirect } from 'next/navigation';
import { serverTrpc } from '@/server/trpc/server';

export default async function LegacyPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await serverTrpc.post.getPostBySlug({ slug });

    redirect(`/post/${slug}`);
  } catch {
    notFound();
  }
}
