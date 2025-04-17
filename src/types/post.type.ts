export type PostResponse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  createdAt: Date;
  tags: string[];
};
