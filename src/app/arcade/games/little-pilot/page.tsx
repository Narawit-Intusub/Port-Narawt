"use client";

import dynamic from "next/dynamic";

const LittlePilotGame = dynamic(
  () => import("./little-pilot-game"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0c16]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4a8ee6] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#4a8ee6] font-mono text-sm tracking-wider animate-pulse">
            LOADING LITTLE PILOT...
          </p>
        </div>
      </div>
    ),
  }
);

export default function LittlePilotPage() {
  return <LittlePilotGame />;
}
