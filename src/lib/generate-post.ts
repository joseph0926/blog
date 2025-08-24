export function generateSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function generatePostContent({
  date,
  slug,
  title,
  description,
  tags,
}: {
  date: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return `---\nslug: \"${date}-${slug}\"\ntitle: \"${title}\"\ndescription: \"${description}\"\ndate: \"${date}\"\ntags: [${tags.map((tag) => `\"${tag}\"`).join(', ')}]\n---\n\n여기에 글을 작성하세요.\n`;
}
