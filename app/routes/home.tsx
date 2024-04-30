// This is the part of the main page for the app. It display the list of functions where the user can navigate to.
// Based on the user type, the user will have different options to navigate to.
// Only the instructor will have the ability to add questions and instructions.

// Author: Jerry Fan
// Date: 4/30/2024

import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { Instruction, Question } from "~/models/question.server";
import { get } from "http";


export default function NotesPage() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">AICADEMY</Link>
        </h1>
        <p>{user.userType}{":  "}{user.email}</p>
        <Form action="/logout" method="post">
          <Link to="/home">
            <button
              type="button"
              className="mr-2 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50">
                Home
            </button>
          </Link>
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600">
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          {/* Always display the New Chat button/link */}
          <Link to="/chat" className="block p-4 text-xl text-blue-500">
            + New Chat
          </Link>
          <hr />

          {/* Conditionally display other buttons based on userType */}
          {user.userType === 'INSTRUCTOR' && (
            <>
              {/* <Link to="/files" className="block p-4 text-xl text-blue-500">
                + New File
              </Link> */} 
              {/* Commented out the New File button */}
              <Link to="/questions" className="block p-4 text-xl text-blue-500">
                + New Question
              </Link>
              <Link to="/instructions" className="block p-4 text-xl text-blue-500">
                + New Instruction
              </Link>
              
              {/* Give instructor the ability to add questions and instructions */}
              <hr />
            </>
          )}
          <Link to="/feedback" className="block p-4 text-xl text-blue-500">+ New Feedback</Link>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
