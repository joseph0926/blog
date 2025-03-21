import path from 'node:path';
import fs from 'node:fs';

export const getPostContent = async (slug: string) => {
  const postPath = path.join(process.cwd(), 'src/mdx', `${slug}.mdx`);
  const source = fs.readFileSync(postPath, 'utf-8');
  return { source };
};
