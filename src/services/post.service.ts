import fs from 'node:fs';
import path from 'node:path';

export const getPostContent = async (slug: string) => {
  const postPath = path.join(process.cwd(), 'src/mdx', `${slug}.mdx`);
  const source = fs.readFileSync(postPath, 'utf-8');
  return { source };
};
