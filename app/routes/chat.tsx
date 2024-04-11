// src/components/Chat.tsx
import React, { useEffect, useState } from "react";
import Message from "./Message";
import OpenAI from 'openai';
import { MessageDto } from "./MessageDto";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useUser } from "~/utils";
import { getInstructionList, createInstruction, deleteInstruction, setDefaultInstruction, getDefaultInstruction, Instruction } from "~/models/instruction.server";
import { LoaderFunction, json } from "@remix-run/node";
import { Question, getQuestion } from '~/models/question.server';
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const defaultInstruction = await getDefaultInstruction();
  const questionId = url.searchParams.get('questionId');

  // Prepare a response structure with default values
  let response = {
    questionBody: "",
    instructionContent: defaultInstruction?.content || "Default instruction content not found."
  };

  if (questionId) {
    const questionDetails = await getQuestion({ id: questionId });

    if (questionDetails) {
      // If question details are found, override the default response values
      response = {
        questionBody: questionDetails.body,
        instructionContent: questionDetails.instruction?.content || defaultInstruction?.content || "Default instruction content not found."
      };
    }
  }

  return json(response);
};

const Chat: React.FC = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<MessageDto>>(new Array<MessageDto>());
  const [input, setInput] = useState<string>("");
  const [assistant, setAssistant] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [openai, setOpenai] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);

  const user = useUser();
  const { questionBody, instructionContent } = useLoaderData<typeof loader>();

  useEffect(() => {
    // Fetch files when the component mounts
    const fetchFiles = async () => {
      try {
        const response = await fetch('/files'); 
        if (!response.ok) throw new Error('Failed to fetch files');
        const data = await response.json();
        setFiles(data.files); // Assume your API returns an object with a 'files' array
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    initChatBot();
  }, []);

  useEffect(() => {
    setMessages([
      {
        content: "Hi, I'm your personal assistant. How can I help you?",
        isUser: false,
      },
    ]);
  }, [assistant]);

  useEffect(() => {
    // Set the textarea's content to questionBody when the component mounts or questionBody changes
    setInput(questionBody || "");
  }, [questionBody]);

  const initChatBot = async () => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true,
    });
    
    // Create an assistant
    const assistant = await openai.beta.assistants.create({
      name: "Computer Science Expert",
      instructions: instructionContent,
      tools: [{"type": "retrieval"}],
      model: "gpt-4-1106-preview",
    });

    // Create a thread
    const thread = await openai.beta.threads.create();

    setOpenai(openai);
    setAssistant(assistant);
    setThread(thread);
  };

  const createNewMessage = (content: string, isUser: boolean) => {
    const newMessage = new MessageDto(isUser, content);
    return newMessage;
  };

  const handleSendMessage = async () => {
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    setInput("");

    // Send a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: input,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Create a response
    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...");
      setIsWaiting(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    setIsWaiting(false);

    // Get the messages for the thread
    const messageList = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessage = messageList.data
      .filter((message: any) => message.run_id === run.id && message.role === "assistant")
      .pop();

    // Print the last message coming from the assistant
    if (lastMessage) {
      console.log(lastMessage.content[0]["text"].value);
      setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, false)]);
    }
  };

  // detect enter key and send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: MessageDto) => {
    // Split the message content by ``` to find code blocks
    const parts = message.content.split(/(```[\s\S]*?```)/);

    return (
      <div className={message.isUser ? "user-message" : "chatbot-message"}>
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            // Extract code from between the backticks
            const code = part.slice(3, -3);
            // Use highlight.js to highlight code
            const highlightedCode = hljs.highlightAuto(code).value;
            // Render the highlighted code within a pre and code block
            return <pre key={index} dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
          } else {
            // Render non-code parts as regular text
            return <span key={index}>{part}</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">AICADEMY</Link>
        </h1>
        <p>{user.userType}: {user.email}</p>
        <Form action="/logout" method="post">
          <Link to="/home">
            <button type="button" className="mr-2 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50">Home</button>
          </Link>
          <button type="submit" className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700">Logout</button>
        </Form>
      </header>
      
      <div style={{ padding: "30px" }}>
        {/* Message display area */}
        <div style={{ marginBottom: "20px", borderBottom: "2px solid #007bff" }}>
          {messages.map((message, index) => (
            <div key={index} style={{ alignSelf: message.isUser ? "flex-end" : "flex-start", backgroundColor: message.isUser ? "#f0f0f0" : "#e1f5fe", padding: "10px", borderRadius: "4px", margin: "5px 0" }}>
              {renderMessageContent(message)}
            </div>
          ))}
        </div>
        
        {/* Input area */}
        <div style={{ backgroundColor: "#f7f7f7", padding: "15px", borderRadius: "4px" }}>
          <textarea
            placeholder="Type your message here..."
            disabled={isWaiting}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "10px" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={15}
          ></textarea>
          {isWaiting && <div style={{ height: "4px", backgroundColor: "#007bff" }}></div>}
          {!isWaiting && (
            <button
              onClick={handleSendMessage}
              disabled={isWaiting}
              style={{ backgroundColor: "#007bff", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;


