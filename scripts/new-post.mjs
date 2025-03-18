import fs from 'node:fs';
import path from 'node:path';

/**
 * argv[0]: Node.js의 실행 경로
 * argv[1]: 실행한 스크립트 경로
 * @description 입력값중 argv[0], argv[1]은 제외하고 title로 인식하도록 구성
 */
const title = process.argv.slice(2).join(' ');

if (!title) {
  console.error('제목을 입력해주세요.');
  process.exit(1);
}

const slug = generateSlug(title);
const date = new Date().toISOString().split('T')[0];
const fileName = `${date}-${slug}.mdx`;

const content = `---
slug: "${date}-${slug}"
title: "${title}"
date: "${date}"
tags: []
---

여기에 글을 작성하세요.
`;

const postsPath = path.join(process.cwd(), 'src/mdx');

fs.writeFileSync(path.join(postsPath, fileName), content);

console.log(`새 글이 생성되었습니다: ${fileName}`);

/**
 * generateSlug
 * @description 사용자 입력값을 바탕으로 slug를 생성
 * @param {string} title
 * @returns slug
 */
function generateSlug(title) {
  return (
    title
      .trim()
      .toLowerCase()
      /** 단어, 공백, 하이픈을 제외한 모든 특수문자를 제거 */
      .replace(/[^\w\s-]/g, '')
      /** 모든 연속된 공백을 하나의 하이픈(-)으로 변경 */
      .replace(/\s+/g, '-')
  );
}
