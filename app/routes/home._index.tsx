import { Link, useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { Question } from "@prisma/client"; // Ensure this import is correct based on your file structure
import { getQuestionList } from "~/models/question.server"; // Ensure this import is correct based on your file structure
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';
import Masonry from 'react-masonry-css';
import '../styles/masonry-grid.css';
import { useEffect } from 'react';

export const loader: LoaderFunction = async () => {
  const questions = await getQuestionList();
  return json({ questions });
};

const breakpointColumnsObj = {
  default: 3, // Default to 3 columns for large PC screens
  1440: 3, // 3 columns for screens wider than 1440px
  1024: 2, // 2 columns for screens smaller than 1440px but larger than 1024px
  768: 2,  // Keep 2 columns for tablets in portrait mode and large phones, catering to smaller devices
};

type LoaderData = {
  questions: Pick<Question, "id" | "title" | "body">[];
};


export default function HomeIndex() {
  const data = useLoaderData() as LoaderData;
  const questions = data?.questions ?? [];

  useEffect(() => {
    hljs.highlightAll();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="flex flex-col items-start justify-start gap-6 p-4">
      <p>Welcome! How can I assist you today?</p>
      
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {questions.length > 0 ? (
          questions.map((question) => (
            <Link
              to={`/chat?questionId=${encodeURIComponent(question.id)}`}
              key={question.id}
              className="block mb-2 rounded-lg shadow bg-white hover:bg-gray-50 relative cursor-pointer"
            >
              <div className="content-wrapper p-4">
                <h2 className="text-xl font-semibold">{question.title}</h2>
                <pre><code>
                <pre><code className="language-java">{question.body}</code></pre>
                </code></pre>
              </div>
            </Link>
          ))
        ) : (
          <p>No questions found.</p>
        )}
      </Masonry>
    </div>
  );
}