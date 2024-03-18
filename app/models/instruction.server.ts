import type {Instruction, User} from "@prisma/client";
import { prisma } from "~/db.server";
import { getSession } from "~/session.server";
import { UserType } from "@prisma/client";
export type { Instruction } from "@prisma/client";

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

export function deleteInstruction({
    id,
    userId,
  }: Pick<Instruction, "id"> & { userId: User["id"] }) {
    return prisma.instruction.deleteMany({
      where: { id, userId },
    });
}

export function getInstructionList() {
    return prisma.instruction.findMany({
      select: { id: true, title: true, content: true, isDefault: true }, // Assuming you have an isDefault field to mark the default instruction
      orderBy: { updatedAt: "desc" },
    });
}

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

export async function setDefaultInstruction(instructionId: any) {
    return prisma.$transaction(async (prisma) => {
        // Set all instructions to not be the default
        await prisma.instruction.updateMany({
            data: { isDefault: false } as any, // Add 'as any' to fix the type error
        });
        // Set the specified instruction to be the default
        return prisma.instruction.update({
            where: { id: instructionId },
            data: { isDefault: true },
        });
    });
}

export async function getDefaultInstruction() {
  return prisma.instruction.findFirst({
    where: { isDefault: true },
  });
}
