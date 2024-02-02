// Import necessary hooks and components from React and Remix
import { Form, json, redirect, useFetcher } from '@remix-run/react';
import React, { useState, useEffect } from 'react';
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { useSearchParams } from '@remix-run/react';

// Assuming useUser hook is correctly set up to fetch user information
import { useUser } from "~/utils";
import styles from "~/styles/test.css";
import { requireUserId } from '~/session.server';
import { createNote } from '~/models/note.server';

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles }
];

export const action = async ({ request }: ActionFunctionArgs) => {
    const userId = await requireUserId(request);
  
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("body");
  
    if (typeof title !== "string" || title.length === 0) {
      return json(
        { errors: { body: null, title: "Title is required" } },
        { status: 400 },
      );
    }
  
    if (typeof body !== "string" || body.length === 0) {
      return json(
        { errors: { body: "Body is required", title: null } },
        { status: 400 },
      );
    }
  
    const note = await createNote({ body, title, userId });
  
    return redirect(`/notes/${note.id}`);
  };

export default function Test() {
    const fetcher = useFetcher();
    const [searchParams] = useSearchParams();
    const initialQuestion = searchParams.get('question') || '';
    const [question, setQuestion] = useState(initialQuestion);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const user = useUser(); // Assuming this returns the current user's information

    // Function to request an AI response
    const askAI = async () => {
        if (question) {
            setIsLoading(true);
            await fetcher.load(`/chat?text=${encodeURIComponent(question)}`);
        }
    };
    
    // Update answer when fetcher has data
    useEffect(() => {
        if (fetcher.data && (fetcher.data as { response: string }).response) {
            setAnswer((fetcher.data as { response: string }).response);
            setIsLoading(false);
        }
    }, [fetcher.data]);

    // Predefined questions for quick selection
    const questions = [
        "What is the purpose of the main method in Java?",
        "How do you declare a variable in Java?",
        "What is the difference between int and double data types in Java?",
    ];
    

    // Function to handle question selection
    const handleQuestionSelect = (selectedQuestion: string) => {
        setQuestion(selectedQuestion);
    };

    const backgroundStyle = {
        backgroundImage: 'url(/images/network.jpg)', // Corrected URL format
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(255, 255, 255, 0.)', // 30% opacity white background
    };
    

    return (
        <div className="flex w-full flex-col gap-1">
            <div>
                <Form method="post">
                    <span>Question: </span>
                    <div style={{ marginTop: '2px', marginBottom:'5px', display: 'flex', alignItems: 'center', border: '2px solid blue', borderRadius: '4px', padding: '2px 8px' }}>
                        <input
                            type="text"
                            name="title"
                            style={{ flex: 1, border: 'none', padding: '0px', marginRight: '0px', outline: 'none' }}
                            placeholder="Type your question here"
                            onChange={(e) => setQuestion(e.target.value)}
                            value={question}
                        />
                        <button 
                            type="button"
                            onClick={askAI} 
                            disabled={isLoading}
                            style={{ 
                                flexShrink: 0,
                                padding: '8px 12px', 
                                fontSize: '16px', 
                                cursor: isLoading ? 'not-allowed' : 'pointer', 
                            }}
                        >
                            Ask AI
                        </button>
                    </div>

                    {isLoading && <div className="loading-spinner" style={{ margin: 'auto' }}></div>}
                    
                    {answer && (
                        <div>
                            <span>Answer: </span>
                            <textarea 
                                readOnly 
                                value={answer}
                                style={{ marginTop: '2px', height: '300px', width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box', border: '2px solid blue', borderRadius: '4px' }}
                            />
                        </div>
                    )}

                    {answer && (
                        <div className="text-right">
                            <input type="hidden" name="body" value={answer} />
                            <button
                                type="submit"
                                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </Form>
            </div>

            {/* Blocks for selecting predefined questions */}
            <div className="mt-4 flex justify-around">
                {questions.map((q, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            handleQuestionSelect(q);
                        }}
                        
                        className="flex-1 rounded-md border-2 border-blue-500 px-3 py-2 m-1 text-lg leading-6 text-left hover:bg-blue-100 focus:outline-none focus:ring"
                    >
                        {q}
                        </button>
                ))}
            </div>
        </div>
    ); 
}