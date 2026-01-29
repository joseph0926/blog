import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { generatePostContent, generateSlug } from '@/lib/generate-post';
import { PostListItem } from '@/services/post.service';

export const createPost = async (data: {
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
}): Promise<PostListItem> => {
  const { title, tags, description, thumbnail } = data;

  const baseSlug = generateSlug(title);
  const date = new Date().toISOString().split('T')[0];

  let finalSlug = `${date}-${baseSlug}`;
  let counter = 2;
  const postsPath = path.join(process.cwd(), 'src/mdx');

  while (fs.existsSync(path.join(postsPath, `${finalSlug}.mdx`))) {
    finalSlug = `${date}-${baseSlug}-${counter}`;
    counter++;
  }

  const fileName = `${finalSlug}.mdx`;
  const content = generatePostContent({
    date,
    title,
    description,
    tags,
    slug: finalSlug,
    thumbnail,
  });

  fs.writeFileSync(path.join(postsPath, fileName), content);

  return {
    id: finalSlug,
    slug: finalSlug,
    title,
    description,
    thumbnail: thumbnail ?? null,
    createdAt: new Date(date),
    tags: tags.map((tag) => ({ id: tag, name: tag })),
  };
};
