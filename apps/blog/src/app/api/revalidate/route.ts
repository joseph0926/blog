import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { slug } = await req.json();
  await Promise.all([
    revalidateTag('posts', 'max'),
    revalidateTag(`post-${slug}`, 'max'),
  ]);
  return Response.json({ revalidated: true });
}
