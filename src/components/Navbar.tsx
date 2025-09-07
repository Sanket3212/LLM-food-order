"use client";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Left Corner - Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-pink-600">🍔 FoodChat</h1>
        </div>

        {/* Right Corner - Auth Section */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : !session ? (
            <button
              onClick={() => signIn("google")}
              className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <div className="relative flex items-center space-x-3">
              <Image
                src={session.user?.image || "/default-avatar.png"}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full ring-2 ring-pink-200"
              />
              <span className="text-gray-700 font-medium text-sm hidden sm:inline">
                {session.user?.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
