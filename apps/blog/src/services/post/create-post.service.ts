import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@/generated/prisma';
import { generatePostContent, generateSlug } from '@/lib/generate-post';

export const createPost = async (
  data: {
    title: string;
    description: string;
    tags: string[];
    thumbnail?: string;
  },
  prisma: PrismaClient,
) => {
  try {
    const { title, tags, description } = data;

    const slug = generateSlug(title);
    const date = new Date().toISOString().split('T')[0];

    let finalSlug = `${date}-${slug}`;
    let counter = 2;

    while (await prisma.post.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${date}-${slug}-${counter}`;
      counter++;
    }

    const fileName = `${finalSlug}.mdx`;

    let post = null;
    try {
      post = await prisma.post.create({
        data: {
          slug: finalSlug,
          title,
          description,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
          thumbnail: data.thumbnail,
        },
        include: {
          tags: true,
        },
      });
    } catch (error) {
      throw new Error(`[DB] Create Post Error: ${error}`);
    }

    const content = generatePostContent({
      date,
      title: post.title,
      description: post.description,
      tags,
      slug,
    });
    const postsPath = path.join(process.cwd(), 'src/mdx');

    try {
      fs.writeFileSync(path.join(postsPath, fileName), content);
    } catch {
      if (post && post.slug) {
        try {
          await prisma.post.delete({
            where: { slug: post.slug },
          });
        } catch {
          // DB 롤백 실패 시 수동 확인 필요: post.slug
        }
      }

      throw new Error(`새 글 생성에 실패하였습니다: ${fileName}`);
    }

    return post;
  } catch (error) {
    throw error;
  }
};
