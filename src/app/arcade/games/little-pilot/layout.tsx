import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Little Pilot",
  description:
    "เกมขับเครื่องบินยิงต่อสู้พิกเซลสุดเร้าใจ ทะยานฝ่าด่านศัตรูเพื่อคว้าคะแนนสูงสุด! | Narawit Arcade",
};

export default function LittlePilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
