import type { Instruction, Question, User } from "@prisma/client";
import { prisma } from "~/db.server";
export type { Question, User, Instruction} from "@prisma/client";

export function createQuestion({
  title,
  body,
  userId,
  instructionId,
}: Pick<Question, 'title' | 'body'> & {
  userId: User['id'];
  instructionId?: Instruction['id']; 
}) {
  const data: any = {
    title,
    body,
    createdBy: {
      connect: { id: userId },
    },
  };

  // If an instructionId is provided, add it to the data object for the create operation
  if (instructionId) {
    data.instruction = {
      connect: { id: instructionId },
    };
  }

  return prisma.question.create({
    data,
  });
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
    select: { id: true, title: true, body: true, instructionId: true, instruction: true},
    orderBy: { createdAt: "desc" },
  });
}

export function getQuestion({
  id,
}: Pick<Question, "id">) {
  return prisma.question.findUnique({
    where: { id },
    select: { id: true, title: true, body: true, createdAt: true, createdBy: true, instructionId: true, instruction: true},
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