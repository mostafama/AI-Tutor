// src/routes/confirmation.tsx
import { Form, Link } from "@remix-run/react";
import React from "react";
import { useUser } from "~/utils"; // Ensure this path is correct based on your project structure

export default function Confirmation() {
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
          <div style={{ marginTop: '50px' }}>
        <h1 style={{ fontWeight: 'bold', fontSize: '32px', marginBottom: '20px' }}>Thank you for your participation!</h1>
        {/* Add any additional content here */}
      </div>
        </div>
      );
}
