// Import the PrismaClient instance
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";
import { json, ActionFunction, LoaderFunction } from "@remix-run/node";

// Loader function to fetch instructions
export const loader: LoaderFunction = async () => {
    const instructions = await prisma.instruction.findMany({
        orderBy: { createdAt: 'asc' },
    });
    return json(instructions);
};

// Action function to handle instruction operations
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const method = formData.get("_method")?.toString().toUpperCase() || request.method;

  switch (method) {
    case "POST":
      const content = formData.get("content")?.toString();
      if (content) {
        // Add a new instruction
        await prisma.instruction.create({
          data: { content, user: { connect: { id: "USER_ID" } } },
        });
      }
      break;
    case "DELETE":
      const id = formData.get("id")?.toString();
      if (id) {
        // Delete an instruction
        await prisma.instruction.delete({
          where: { id },
        });
      }
      break;
    // Optionally, add more cases for UPDATE or other operations as needed
    default:
      throw new Error(`The HTTP ${method} method is not supported at this route.`);
  }

  return json({ success: true });
};