"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BackToArcadeButton() {
  const pathname = usePathname();
  const isLobby = pathname === "/arcade" || pathname === "/arcade/";

  if (isLobby) return null;

  return (
    <div className="fixed top-6 left-6 z-50">
      <Link
        href="/arcade"
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/90 text-cyan-300 font-medium text-sm transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Arcade
      </Link>
    </div>
  );
}
