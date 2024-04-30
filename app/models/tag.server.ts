// Purpose: Provide functions for interacting with the Tag model in the database.

// Author: Jerry Fan
// Date: 4/30/2024

import { prisma } from "~/db.server";
import type { Question, User, Tag } from "@prisma/client";
export type { Question, User, Tag };

// creates a new tag with the provided name
export async function createTag({ name }: { name: string }) {
  return prisma.tag.create({
    data: { name },
  });
}

// gets a list of all tags, including the questions associated with each tag
export async function getTagList() {
  return prisma.tag.findMany({
    include: { questions: true },
  });
}

// gets a single tag by its ID, including the questions associated with it
export async function getTag({ id }: { id: number }) {
  return prisma.tag.findUnique({
    where: { id },
    include: { questions: true },
  });
}

// updates a tag with the provided name
export async function updateTag({ id, name }: { id: number; name?: string }) {
  const data: any = {};
  if (name) {
    data.name = name;
  }

  // Update the tag with the new name
  return prisma.tag.update({
    where: { id },
    data,
  });
}

// deletes a tag by its ID
export async function deleteTag({ id }: { id: number }) {
  return prisma.tag.delete({
    where: { id },
  });
}

// assigns a set of tags to a question
export async function assignTagsToQuestion({ questionId, tagIds }: { questionId: string; tagIds: number[] }) {
  await prisma.question.update({
    where: { id: questionId },
    data: { tags: { set: [] } },
  });

  return prisma.question.update({
    where: { id: questionId },
    data: {
      tags: {
        connect: tagIds.map(id => ({ id })),
      },
    },
  });
}
