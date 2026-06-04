"use client";

import dynamic from "next/dynamic";

const HandPenGame = dynamic(
  () => import("./hand-pen-game").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-[#050301]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F5D061] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#F5D061] font-mono text-sm tracking-wider animate-pulse">
            LOADING NEON HAND PEN...
          </p>
        </div>
      </div>
    ),
  }
);

export default function HandPenPage() {
  return <HandPenGame />;
}
