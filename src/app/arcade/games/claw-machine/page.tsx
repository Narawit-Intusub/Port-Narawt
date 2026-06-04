"use client";

import dynamic from "next/dynamic";

const ClawMachineGame = dynamic(
  () => import("./claw-machine-game"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-[#84dfe2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#57280f] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#57280f] font-mono text-sm tracking-wider animate-pulse">
            LOADING CLAW MACHINE...
          </p>
        </div>
      </div>
    ),
  }
);

export default function ClawMachinePage() {
  return <ClawMachineGame />;
}