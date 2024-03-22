import type { Instruction, Question, User, Tag } from "@prisma/client";
import { ifError } from "node:assert";
import { prisma } from "~/db.server";
export type { Question, User, Instruction} from "@prisma/client";

export async function createQuestion({
  title,
  body,
  userId,
  instructionId,
  tagNames,
}: Pick<Question, 'title' | 'body'> & {
  userId: User['id'];
  instructionId?: Instruction['id']; 
  tagNames?: string[];
}) {
  let tagsOperation = {};

  if (tagNames && tagNames.length > 0) {
    tagsOperation = {
      connectOrCreate: tagNames.map(name => ({
        where: { name },
        create: { name },
      })),
    };
  }

  const data: any = {
    title,
    body,
    createdBy: { connect: { id: userId } },
    ...(instructionId && { instruction: { connect: { id: instructionId } } }),
    tags: tagsOperation,
  };

  return prisma.question.create({ data });
}

export function deleteQuestion({
  id,
  userId,
}: Pick<Question, "id"> & { userId: User["id"] }) {
  return prisma.question.deleteMany({
    where: { id, userId },
  });
}

export function getQuestionList() {
  return prisma.question.findMany({
    select: { id: true, title: true, body: true, instructionId: true, instruction: true, tags: true},
    orderBy: { createdAt: "desc" },
  });
}

export function getQuestion({
  id,
}: Pick<Question, "id">) {
  return prisma.question.findUnique({
    where: { id },
    select: { id: true, title: true, body: true, createdAt: true, createdBy: true, instructionId: true, instruction: true, tags: true},
  });
}

export function assignInstruction({
  questionId,
  instructionId,
}: {
  questionId: string; 
  instructionId: string; 
}) {
  return prisma.question.update({
    where: { id: questionId },
    data: {
      instructionId: instructionId, 
    },
  });
}

export async function updateQuestion({
  id,
  title,
  body,
  instructionId,
  tagNames,
}: Pick<Question, 'id'> & Partial<Pick<Question, 'title' | 'body'>> & {
  instructionId?: Instruction['id']; 
  tagNames?: string[];
}) {
  const data: any = {
    ...(title && { title }),
    ...(body && { body }),
    ...(instructionId && { instruction: { connect: { id: instructionId } } }),
  };

  if (tagNames) {
    data.tags = {
      set: [], // Disconnect all current tags
      connectOrCreate: tagNames.map(name => ({
        where: { name },
        create: { name },
      })),
    };
  }

  return prisma.question.update({
    where: { id },
    data,
  });
}