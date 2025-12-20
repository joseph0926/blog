import fs from 'node:fs';
import path from 'node:path';

export const getPostContent = async (slug: string) => {
  const decodedSlug = decodeURIComponent(slug);
  const postPath = path.join(process.cwd(), 'src/mdx', `${decodedSlug}.mdx`);
  const source = fs.readFileSync(postPath, 'utf-8');
  return { source };
};

export const getAllPostSlugs = async (): Promise<string[]> => {
  const mdxDir = path.join(process.cwd(), 'src/mdx');
  const files = fs.readdirSync(mdxDir);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
};
