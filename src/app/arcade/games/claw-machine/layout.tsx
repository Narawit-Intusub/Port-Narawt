import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claw Machine",
  description:
    "คีบตุ๊กตาพิกเซลแสนน่ารักสุดคลาสสิก ทดสอบความแม่นยำและจังหวะของคุณ! | Narawit Arcade",
};

export default function ClawMachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
