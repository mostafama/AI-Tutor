import { Link, useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { Question } from "@prisma/client"; // Ensure this import is correct based on your file structure
import { getQuestionList } from "~/models/question.server"; // Ensure this import is correct based on your file structure
import { getTagList } from "~/models/tag.server"; // Ensure this import is correct based on your file structure
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';
import Masonry from 'react-masonry-css';
import '../styles/grid.css';
import { useEffect } from 'react';
import { useState } from 'react';

export const loader: LoaderFunction = async () => {
  const [questions, tags] = await Promise.all([
    getQuestionList(),
    getTagList()
  ]);
  return json({ questions, tags });
};

type LoaderData = {
  questions: Pick<Question, "id" | "title" | "body">[];
  tags: { id: number; name: string; }[];
};


export default function HomeIndex() {
  const { questions, tags } = useLoaderData<LoaderData>();
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  // Filter questions based on the selected tag
  const filteredQuestions = selectedTagId
    ? questions.filter(question => question.tags?.some((tag: { id: number; }) => tag.id === selectedTagId))
    : questions;

  useEffect(() => {
    hljs.highlightAll();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div>
      {/* Questions Section */}
      <div className="grid-container">
        {filteredQuestions.map((question) => (
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

      {/* Tags Section */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '10px', fontSize: '24px' }}>Tags</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(tag.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedTagId === tag.id ? '#0056b3' : '#007BFF', // Highlight selected tag
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSelectedTagId(null)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d', // Neutral grey for clear button
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}