export type PostResponse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  createdAt: Date;
  tags: string[];
};

export type UpdatePostPayload = {
  thumbnail: string;
};
export type UpdatePostResponse = {
  slug: string;
  thumbnail: string | null;
  updatedAt: Date;
};
