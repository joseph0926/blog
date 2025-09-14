export function generateSlug(title: string) {
  const slug = title.trim().toLowerCase();
  return slug
    .replace(/[^a-z0-9\s-]/g, '')
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
