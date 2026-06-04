import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hand Pen",
  description:
    "วาดภาพกลางอากาศด้วยมือของคุณผ่านกล้องเว็บแคม! สัมผัสประสบการณ์ AI Gesture Art สุดล้ำ | Narawit Arcade",
};

export default function HandPenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
