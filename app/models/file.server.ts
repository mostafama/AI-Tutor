// Purpose: Backend logic for the file upload
// However, this function is not fully working, as to access server files in assitant API is not implemented

// Frontend: file.tsx
// Author: Jerry Fan
// Date: 4/30/2024

import type { File, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { unstable_createFileUploadHandler, unstable_parseMultipartFormData, json } from "@remix-run/node";
import { useUser } from "~/utils";

// Assuming the File model from your schema
export type { File, User };

// Function to upload and create a file record in the database
export async function createFile({
  name,
  path,
  userId,
}: Pick<File, "name" | "path"> & { userId: User["id"] }) {
  return prisma.file.create({
    data: {
      name,
      path,
      userId,
    },
  });
}

// Function to list all files uploaded by a user
export async function listUserFiles(userId: User["id"]) {
  return prisma.file.findMany({
    where: { userId },
    select: { id: true, name: true, path: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

// Function to get details of a single file by its ID
export async function getFileDetails(fileId: File["id"]) {
  return prisma.file.findUnique({
    where: { id: fileId },
    select: { id: true, name: true, path: true, createdAt: true, userId: true },
  });
}

// Function to delete a file record from the database
export async function deleteFile(fileId: File["id"], userId: User["id"]) {
  return prisma.file.deleteMany({
    where: { id: fileId, userId },
  });
}
