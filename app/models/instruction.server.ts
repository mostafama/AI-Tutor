// Purpose: Backend logic for instruction creation, deletion, default set up and retrieval
// Frontend: instruction.tsx
// Author: Jerry Fan
// Date: 4/30/2024

import type {Instruction, User} from "@prisma/client";
import { prisma } from "~/db.server";
import { getSession } from "~/session.server";
import { UserType } from "@prisma/client";
export type { Instruction } from "@prisma/client";

// Create a new instruction
export function createInstruction({
  title,
  content,
  userId,
}: Pick<Instruction, "title" | "content"> & {
  userId: User["id"];
}) {
  return prisma.instruction.create({
    data: {
      title,
      content,
      createdBy: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

// Delete an existing instruction
export function deleteInstruction({
    id,
    userId,
  }: Pick<Instruction, "id"> & { userId: User["id"] }) {
    return prisma.instruction.deleteMany({
      where: { id, userId },
    });
}

// Get a list of all instructions
export function getInstructionList() {
    return prisma.instruction.findMany({
      select: { id: true, title: true, content: true, isDefault: true }, 
      orderBy: { updatedAt: "desc" },
    });
}

// Get a single instruction by its ID and the user ID
export function getInstruction({
    id,
    userId,
  }: Pick<Instruction, "id"> & {
    userId: User["id"];
  }) {
    return prisma.instruction.findFirst({
      select: { id: true, content: true, title: true },
      where: { id, userId },
    });
  }

// Set up the default instruction that it will apply to all questions unless otherwise specified
export async function setDefaultInstruction(instructionId: any) {
    return prisma.$transaction(async (prisma) => {
        await prisma.instruction.updateMany({
            data: { isDefault: false } as any,
        });
        return prisma.instruction.update({
            where: { id: instructionId },
            data: { isDefault: true },
        });
    });
}

// Get the default instruction
export async function getDefaultInstruction() {
  return prisma.instruction.findFirst({
    where: { isDefault: true },
  });
}
