import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Tetris",
  description:
    "เกมต่อบล็อกระดับตำนาน เรียงแถวให้เคลียร์เพื่อคว้าคะแนนสูงสุดระดับพระกาฬ | Narawit Arcade",
};

export default function TetrisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
