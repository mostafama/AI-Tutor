import { Link, useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { Question } from "@prisma/client"; // Ensure this import is correct based on your file structure
import { getQuestionList } from "~/models/question.server"; // Ensure this import is correct based on your file structure
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';
import Masonry from 'react-masonry-css';
import '../styles/grid.css';
import { useEffect } from 'react';

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

  useEffect(() => {
    hljs.highlightAll();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="grid-container">
      {questions.map((question) => (
        <Link
          to={`/chat?questionId=${encodeURIComponent(question.id)}`}
          key={question.id}
          className="card"
        >
          <div className="card-content">
            <h2 className="card-title">{question.title}</h2>
            <div className="card-body">
              <pre><code className="language-java">{question.body}</code></pre>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}