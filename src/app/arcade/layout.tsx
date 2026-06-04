import React from "react";
import { BackToArcadeButton } from "./back-to-arcade-button";


export default function ArcadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Floating Back Navigation Button for Games (client component) */}
      <BackToArcadeButton />
      {children}
    </div>
  );
}
