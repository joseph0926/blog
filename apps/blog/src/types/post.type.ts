export type TagResponse = {
  id: string;
  name: string;
};
export type PostResponse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  createdAt: Date;
  tags: TagResponse[];
};

export type UpdatePostPayload = {
  thumbnail: string;
};
export type UpdatePostResponse = {
  slug: string;
  thumbnail: string | null;
  updatedAt: Date;
};
