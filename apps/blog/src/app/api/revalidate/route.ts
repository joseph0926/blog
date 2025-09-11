import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { slug } = await req.json();
  await Promise.all([revalidateTag('posts'), revalidateTag(`post-${slug}`)]);
  return Response.json({ revalidated: true });
}
