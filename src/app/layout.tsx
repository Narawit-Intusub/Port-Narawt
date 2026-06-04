import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const lineSeed = localFont({
  src: "./fonts/LINESeedSansTH_Rg.ttf",
  variable: "--font-sans",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Narawit | Portfolio",
  description: "Portfolio of Narawit Intusub, a Computer Engineering Student and Full-stack Developer Enthusiast.",
  icons: {
    icon: "/images/logo/N-Logo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        lineSeed.variable
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
