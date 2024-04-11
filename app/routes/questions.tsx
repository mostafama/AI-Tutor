// file: app/routes/questions.tsx
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, Link, Form, redirect } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getQuestionList, createQuestion, deleteQuestion, assignInstruction } from "~/models/question.server";
import { createInstruction, getInstructionList, getDefaultInstruction } from "~/models/instruction.server";
import { assignTagsToQuestion, createTag, getTagList } from "~/models/tag.server";
import { Question } from "@prisma/client";
import { TrashIcon } from "@heroicons/react/20/solid";
import { prisma } from "~/db.server";

interface Instruction {
    id: string;
    title: string;
  }
  
  interface LoaderData {
    questions: Question[]; 
    instructions: Instruction[];
  }

export const loader: LoaderFunction = async ({ request }) => {
    // Removed courseId usage
    const userId = await requireUserId(request);
    const questions = await getQuestionList(); // Adjusted call to match updated backend logic
    const instructions  = await getInstructionList()
    const defaultInstruction = await getDefaultInstruction();
    return json({ questions, instructions, defaultInstruction  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const actionType = formData.get('_action');

  switch (actionType) {
      case 'delete':
          const deleteId = formData.get('questionId');
          if (typeof deleteId === 'string') {
              await deleteQuestion({ id: deleteId, userId });
              return redirect('/questions');
          }
          break;

      case "assignInstruction":
          const questionIdAssign = formData.get("questionId");
          const selectedInstructionId = formData.get("instructionId");
          if (typeof questionIdAssign === "string" && typeof selectedInstructionId === "string") {
              await assignInstruction({ questionId: questionIdAssign, instructionId: selectedInstructionId });
              return redirect("/questions");
          }
          break;

      default:
          const title = formData.get('title');
          const body = formData.get('content');
          const tagInput = formData.get('tags');
          const instructionId = formData.get('instructionId') === "default" ? (await getDefaultInstruction())?.id : formData.get('instructionId');
          
          if (typeof title === 'string' && typeof body === 'string' && instructionId) {
              // Assuming createQuestion returns the newly created question object
              const question = await createQuestion({
                  title,
                  body,
                  userId,
                  instructionId: instructionId.toString(), // Ensure instruction ID is correctly assigned
              });

              if (typeof tagInput === 'string' && tagInput.trim() !== '') {
                  const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                  const tagIds = [];
          
                  for (const tagName of tags) {
                      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                      if (!tag) {
                          tag = await createTag({ name: tagName });
                      }
                      tagIds.push(tag.id);
                  }

                  // Assuming assignTagsToQuestion expects a string for questionId
                  await assignTagsToQuestion({ questionId: question.id, tagIds });
              }

              return redirect('/questions');
          }
          break;
  }

  return null;
};

export default function QuestionsPage() {
    const { questions, instructions, defaultInstruction } = useLoaderData<typeof loader>();
    const user = useUser();
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
                        className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600"
                    >
                        Logout
                    </button>
                </Form>
            </header>

            <main className="flex flex-grow p-4 gap-4">
  <div className="w-1/3 overflow-auto">
    <h2 className="text-2xl font-bold mb-4">Questions Dashboard</h2>
    {questions.length > 0 ? (
      questions.map((question: Question & { instruction?: Instruction }) => (
        <div key={question.id} className="group p-4 mb-2 rounded-lg shadow bg-white hover:bg-gray-50 relative">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold">{question.title}</p>
              <p className="mt-2 text-gray-600">{question.body}</p>
            </div>

            {/* Delete button with Trash Icon */}
            <Form method="post" className="ml-4">
              <input type="hidden" name="questionId" value={question.id} />
              <input type="hidden" name="_action" value="delete" />
              <button type="submit" title="Delete question">
                <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100" />
              </button>
            </Form>
          </div>
          {/* Dropdown for assigning instructions */}
          <Form method="post">
            <input type="hidden" name="defaultInstructionId" value={defaultInstruction?.id || ''} />
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="_action" value="assignInstruction" />
            <select
              name="instructionId"
              defaultValue={question.instructionId || (defaultInstruction ? defaultInstruction.id : "")}
              onChange={(e) => e.currentTarget.form?.submit()}
              className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"
            >
              {instructions.map((instruction: Instruction) => (
                <option key={instruction.id} value={instruction.id}>
                  {instruction.title}
                </option>
              ))}
            </select>
          </Form>
        </div>
      ))
    ) : (
      <p>No questions found.</p>
    )}
  </div>

                {user.userType === 'INSTRUCTOR' && (
                    <div className="flex-1 p-4 bg-white rounded-lg shadow">
                        <Form method="post" className="space-y-6">
                            <h3 className="text-lg font-semibold">Add New Question</h3>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Question Title</label>
                                <input type="text" name="title" id="title" required className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Question Content</label>
                                <textarea name="content" id="content" required rows={4} className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"></textarea>
                            </div>
                            {/* Instruction selection dropdown */}
                            <div>
                                <label htmlFor="instructionId" className="block text-sm font-medium text-gray-700">Instruction (optional)</label>
                                <select name="instructionId" id="instructionId" className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm">
                                    {/* Explicitly include a "Default" option */}
                                    <option value="default">Default Instruction</option>
                                    {instructions.map((instruction:Instruction) => (
                                        <option key={instruction.id} value={instruction.id}>
                                            {instruction.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                              <textarea
                                name="tags"
                                id="tags"
                                placeholder="Enter tags, separated by commas"
                                className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"
                              ></textarea>
                            </div>
                            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                Submit Question
                            </button>
                        </Form>
                    </div>
                )}
            </main>
        </div>
    );
}