"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function ProfileCard() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="w-80 flex-shrink-0 flex items-center justify-center">
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-pink-600 text-white font-bold rounded-lg shadow"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-pink-600 rounded-2xl border-4 border-black p-6 flex flex-col items-center shadow-xl">
        <div className="bg-white px-4 py-2 rounded-lg border-2 border-black -mt-10 mb-4 shadow-md">
          <h1 className="text-xl font-bold">{session.user?.name}</h1>
        </div>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="User Avatar"
            width={120}
            height={120}
            className="rounded-full border-4 border-black"
          />
        )}
        <p className="mt-4 text-lg font-bold text-white">
          @{session.user?.email?.split("@")[0]}
        </p>
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 bg-white text-pink-600 font-bold rounded-lg shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
