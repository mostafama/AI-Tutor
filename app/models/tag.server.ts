// Import necessary entities and initialize PrismaClient
import { prisma } from "~/db.server";
import type { Question, User, Tag } from "@prisma/client";
export type { Question, User, Tag };

export async function createTag({ name }: { name: string }) {
  // Create a new tag with the given name
  return prisma.tag.create({
    data: { name },
  });
}

export async function getTagList() {
  // Fetch all tags, including the questions associated with each
  return prisma.tag.findMany({
    include: { questions: true },
  });
}

export async function getTag({ id }: { id: number }) {
  // Fetch a single tag by its ID, including associated questions
  return prisma.tag.findUnique({
    where: { id },
    include: { questions: true },
  });
}

export async function updateTag({ id, name }: { id: number; name?: string }) {
  // Prepare the data for tag update
  const data: any = {};
  if (name) {
    data.name = name; // Update name if provided
  }

  // Update the tag with the new name
  return prisma.tag.update({
    where: { id },
    data,
  });
}

export async function deleteTag({ id }: { id: number }) {
  // Delete a tag by its ID
  return prisma.tag.delete({
    where: { id },
  });
}

export async function assignTagsToQuestion({ questionId, tagIds }: { questionId: string; tagIds: number[] }) {
  // First, clear any existing tags from the question
  await prisma.question.update({
    where: { id: questionId },
    data: { tags: { set: [] } },
  });

  // Then, connect the question to the new set of tags
  return prisma.question.update({
    where: { id: questionId },
    data: {
      tags: {
        connect: tagIds.map(id => ({ id })),
      },
    },
  });
}
