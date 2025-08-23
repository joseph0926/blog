import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
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
    const fileName = `${date}-${slug}.mdx`;

    const existingPost = await prisma.post.findUnique({
      where: {
        slug: `${date}-${slug}`,
      },
    });
    if (existingPost) {
      console.error(`createPost > existingPost Error`);
      throw new Error('이미 존재하는 slug입니다');
    }

    let post = null;
    try {
      post = await prisma.post.create({
        data: {
          slug: `${date}-${slug}`,
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
      console.error('[DB] Create Post Error: ', error);
      throw new Error(`[DB] Create Post Error: ${error}`);
    }

    const content = generatePostContent({
      date,
      title: post.title,
      description: post.description,
      tags,
      slug: post.slug,
    });
    const postsPath = path.join(process.cwd(), 'src/mdx');

    try {
      fs.writeFileSync(path.join(postsPath, fileName), content);
    } catch (fileError) {
      console.error('[FILE] Create Post Error: ', fileError);

      if (post && post.slug) {
        try {
          await prisma.post.delete({
            where: { slug: post.slug },
          });
          console.log('DB 롤백 성공');
        } catch (rollbackError) {
          console.error('DB 롤백 실패! 수동으로 확인 필요:', post.slug);
          console.error('Rollback Error:', rollbackError);
        }
      }

      console.log(`새 글 생성에 실패하였습니다: ${fileError}`);
      throw new Error(`새 글 생성에 실패하였습니다: ${fileName}`);
    }

    return post;
  } catch (error) {
    console.error(`createPost Error: ${error}`);
    throw error;
  }
};
