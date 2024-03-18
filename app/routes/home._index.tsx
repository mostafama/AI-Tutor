import { Link, useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { Question } from "@prisma/client"; // Ensure this import is correct based on your file structure
import { getQuestionList } from "~/models/question.server"; // Ensure this import is correct based on your file structure

export const loader: LoaderFunction = async () => {
  const questions = await getQuestionList();
  
  return json({ questions });
};


type LoaderData = {
  questions: Pick<Question, "id" | "title" | "body">[];
};

export default function HomeIndex() {
  const data = useLoaderData() as LoaderData;
  const questions = data?.questions ?? [];

  return (
    <div className="flex flex-col items-start justify-start gap-6 p-4">
      <p>Welcome! How can I assist you today?</p>

      {/* Render noteListItems if you have them. Adjust according to your needs. */}
      
      {/* Questions display section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.length > 0 ? (
        questions.map((question) => (
          <Link
            to={`/chat?questionId=${encodeURIComponent(question.id)}`}
            key={question.id}
            className="block p-4 mb-2 rounded-lg shadow bg-white hover:bg-gray-50 relative cursor-pointer"
          >
            <div>
              <h2 className="text-xl font-semibold">{question.title}</h2>
              <p className="mt-2">{question.body}</p>
              {/* Simplified for brevity; include other details as necessary */}
            </div>
          </Link>
        ))
      ) : (
        <p>No questions found.</p>
      )}
      </div>
    </div>
  );
}