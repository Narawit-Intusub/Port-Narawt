import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Narawit Arcade",
    default: "Games | Narawit Arcade",
  },
  description:
    "มินิเกมย้อนยุคสุดคลาสสิกที่พัฒนาด้วยโค้ดเว็บ โดย Narawit Intusub",
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {children}
    </div>
  );
}
