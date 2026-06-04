"use client";

import dynamic from "next/dynamic";

const TetrisGame = dynamic(
  () => import("./tetris-game").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0c16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ff3e3e] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#ff3e3e] font-mono text-sm tracking-wider animate-pulse">
            LOADING RETRO TETRIS...
          </p>
        </div>
      </div>
    ),
  }
);

export default function TetrisPage() {
  return <TetrisGame />;
}
