import type {
  Capture,
  CaptureType,
  LearningNote,
  Status,
  Tag,
} from '@/generated/prisma/client';

export type CreateCaptureInput = {
  content: string;
  context?: string;
  type?: CaptureType;
  tags?: string[];
};

export type UpdateCaptureInput = {
  content?: string;
  context?: string;
  type?: CaptureType;
  status?: Status;
  tags?: string[];
};

export type CaptureWithRelations = Capture & {
  tags: Tag[];
  _count: {
    notes: number;
  };
};

export type CaptureDetail = Capture & {
  tags: Tag[];
  notes: LearningNote[];
};

export type CaptureFilter = {
  status?: Status;
  type?: CaptureType;
  tagId?: string;
  searchQuery?: string;
};

export type CaptureSort = 'latest' | 'oldest' | 'updated';
