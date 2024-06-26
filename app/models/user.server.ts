// Purpose: Backend logic for user creation, verification, and retrieval
// This file comes from the Remix starter template

import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string, userType: User["userType"]) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      userType, // Include userType in the user creation
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function getUserType(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { userType: true },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user.userType;
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
