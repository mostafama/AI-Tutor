import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative bg-white">
      <div className="min-h-screen flex flex-col">
        <div className="relative">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/network.jpg"
            alt="Network"
          />
          <div className="absolute inset-0 bg-[color:rgba(27,167,254,0.5)] mix-blend-multiply" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen sm:px-6 lg:px-8">
            <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
              <span className="block uppercase drop-shadow-md" style={{ color: "beige" }}>
                AIcademy
              </span>
            </h1>
            <span className="mx-auto mt-6 max-w-lg text-center text-xl sm:max-w-3xl" style={{ color: "beige" }}>
              Academic AI: Programming Made Clear and Simple
            </span>
            {user ? (
              <Link
                to="/notes"
                className="mt-5 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Continue as {user.email}
              </Link>
            ) : (
              <div className="mt-6 flex space-x-4 justify-center"> {/* Flex container for buttons */}
                <Link
                  to="/join"
                  className="rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
