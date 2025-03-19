import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** `readline` 모듈을 통해 CLI 사용자 입력을 컨트롤 */
const rl = readline.createInterface({
  /** 키보드로 입력한 데이터를 읽을 수 있도록 설정 */
  input: process.stdin,
  /** 터미널에 메시지를 출력하도록 설정 */
  output: process.stdout,
});

/**
 * prompt
 * @param {String} question cli에 나올 질문
 * @returns `Promise`
 */
async function prompt(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

(async () => {
  try {
    const title = (await prompt('제목을 입력하세요: ')).trim();

    if (!title) {
      console.error('제목은 필수 입력사항입니다.');
      process.exit(1);
    }

    const description = (await prompt('설명을 입력하세요: ')).trim();
    const tagsInput = (
      await prompt('태그를 쉼표(,)로 구분하여 입력하세요: ')
    ).trim();

    const tags = tagsInput
      ? tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const slug = generateSlug(title);
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${date}-${slug}.mdx`;

    const existingPost = await prisma.post.findUnique({
      where: {
        slug: `${date}-${slug}`,
      },
    });
    if (existingPost) {
      console.error('이미 존재하는 slug입니다:', error);
      await prisma.$disconnect;
      rl.close();
      return;
    }

    const content = `---\nslug: \"${date}-${slug}\"\ntitle: \"${title}\"\ndescription: \"${description}\"\ndate: \"${date}\"\ntags: [${tags.map((tag) => `\"${tag}\"`).join(', ')}]\n---\n\n여기에 글을 작성하세요.\n`;

    const postsPath = path.join(process.cwd(), 'src/mdx');

    fs.writeFileSync(path.join(postsPath, fileName), content);

    await prisma.post.create({
      data: {
        slug: `${date}-${slug}`,
        title,
        description,
        tags,
      },
    });

    console.log(`새 글이 생성되었습니다: ${fileName}`);
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
})();

/**
 * generateSlug
 * @description 사용자 입력값을 바탕으로 slug를 생성
 * @param {string} title
 * @returns slug
 */
function generateSlug(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
