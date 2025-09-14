import type { Status } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma.server';
import type {
  CreateCaptureInput,
  UpdateCaptureInput,
} from '@/types/capture.type';

export async function getAllCaptures() {
  return prisma.capture.findMany({
    include: {
      tags: true,
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCaptureById(id: string) {
  return prisma.capture.findUnique({
    where: { id },
    include: {
      tags: true,
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createCapture(input: CreateCaptureInput) {
  const { tags, dueDate, ...data } = input;

  return prisma.capture.create({
    data: {
      ...data,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags?.length
        ? {
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
    },
    include: { tags: true },
  });
}

export async function updateCapture(id: string, input: UpdateCaptureInput) {
  const { tags, dueDate, ...data } = input;

  return prisma.capture.update({
    where: { id },
    data: {
      ...data,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags
        ? {
            set: [],
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
    },
    include: { tags: true },
  });
}

export async function updateCaptureStatus(id: string, status: Status) {
  return prisma.capture.update({
    where: { id },
    data: { status },
    include: { tags: true },
  });
}

export async function deleteCapture(id: string) {
  return prisma.capture.delete({
    where: { id },
  });
}

export async function searchCaptures(query: string) {
  return prisma.capture.findMany({
    where: {
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
        { context: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    include: {
      tags: true,
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
