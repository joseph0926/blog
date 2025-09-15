import type { LearningNote, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma.server';

export class LearningNoteService {
  static async findByCaptureId(captureId: string): Promise<LearningNote[]> {
    return prisma.learningNote.findMany({
      where: { captureId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async findById(id: string): Promise<LearningNote | null> {
    return prisma.learningNote.findUnique({
      where: { id },
      include: {
        capture: true,
      },
    });
  }

  static async create(
    data: Prisma.LearningNoteCreateInput,
  ): Promise<LearningNote> {
    return prisma.learningNote.create({
      data,
    });
  }

  static async update(
    id: string,
    data: Prisma.LearningNoteUpdateInput,
  ): Promise<LearningNote> {
    return prisma.learningNote.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<LearningNote> {
    return prisma.learningNote.delete({
      where: { id },
    });
  }

  static async findRecentNotes(limit: number = 10): Promise<LearningNote[]> {
    return prisma.learningNote.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        capture: true,
      },
    });
  }
}
