import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Link, Form, redirect, useFetcher } from "@remix-run/react";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import { getInstructionList, createInstruction, deleteInstruction, setDefaultInstruction, getDefaultInstruction } from "~/models/instruction.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { Instruction } from "~/models/instruction.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const instructions = await getInstructionList(); // Remove the argument { userId }
  const defaultInstruction = await getDefaultInstruction();
  
  return json({ instructions, defaultInstruction });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const actionType = formData.get("_action");

  switch (actionType) {
    case "delete":
      const deleteId = formData.get("instructionId");
      if (typeof deleteId === "string") {
        await deleteInstruction({ id: deleteId, userId });
        return redirect("/instructions"); // Ensure redirect after delete
      }
      break;
    case "setDefault":
      const defaultId = formData.get("instructionId");
      if (typeof defaultId === "string") {
        await setDefaultInstruction(defaultId);
        return redirect("/instructions"); // Ensure redirect after setting default
      }
      break;
    default:
      const title = formData.get("title");
      const content = formData.get("content");
      if (typeof title === "string" && typeof content === "string") {
        await createInstruction({ title, content, userId });
        return redirect("/instructions"); // Ensure redirect after creation
      }
      break;
  }
  return null; // Return null or another appropriate value if no other return has been hit
};

export default function InstructionsPage() {
  const { instructions, defaultInstruction} = useLoaderData<typeof loader>();
  const user = useUser();
  const fetcher = useFetcher();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">AICADEMY</Link>
        </h1>
        <p>{user.userType}: {user.email}</p>
        <Form action="/logout" method="post">
          <Link to="/home">
            <button
              type="button"
              className="mr-2 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
            >
              Home
            </button>
          </Link>
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Logout
          </button>
        </Form>
      </header>
  
      <main className="flex flex-grow p-4 gap-4">
        <div className="w-1/3 overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Instruction Dashboard</h2>
          {/* Highlight and display the default instruction at the top */}
          {defaultInstruction && (
            <div className="mb-4 p-4 rounded-lg shadow bg-green-100">
              <h2 className="text-xl font-bold text-green-700">Default Instruction</h2>
              <p className="text-lg font-semibold">{defaultInstruction.title}</p>
              <p className="mt-2">{defaultInstruction.content}</p>
            </div>
          )}
          
          {instructions.length > 0 ? (
      instructions.map((instruction: any) => (
        <div key={instruction.id} className="group p-4 mb-2 rounded-lg shadow bg-white hover:bg-gray-50">
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-semibold hover:text-blue-600">{instruction.title}</p>
              <p className="mt-2 text-gray-600">{instruction.content}</p>
            </div>
            {user.userType === 'INSTRUCTOR' && (
              <div className="flex space-x-2 items-center opacity-0 group-hover:opacity-100">
                <button name="_action" value="setDefault" type="button" title="Set as Default" onClick={() => fetcher.submit({ instructionId: instruction.id, _action: "setDefault" }, { method: "post" })}>
                  <StarIcon className={`h-6 w-6 ${instruction.isDefault ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`} />
                </button>
                <fetcher.Form method="post">
                  <input type="hidden" name="instructionId" value={instruction.id} />
                  <button name="_action" value="delete" type="submit" title="Delete Instruction">
                    <TrashIcon className="h-6 w-6 text-red-600 hover:text-red-800" />
                  </button>
                </fetcher.Form>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <p>No instructions found.</p>
    )}
  </div>
  
        <div className="flex-1 p-4 bg-white rounded-lg shadow">
          {user.userType === 'INSTRUCTOR' && (
            <Form method="post" className="space-y-6">
              <h3 className="text-lg font-semibold">Add New Instruction</h3>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  name="content"
                  id="content"
                  rows={25}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Instruction
              </button>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
}