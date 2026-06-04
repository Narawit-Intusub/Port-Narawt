"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { ContactDrawer } from "@/components/contact-drawer";
import { Footer } from "@/components/footer";
import { IntroSection } from "@/components/sections/intro";
import { ProjectsSection } from "@/components/sections/projects";
import { TechStack } from "@/components/sections/tech-stack";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem("narawit-theme");

      if (savedTheme) {
        setDarkMode(savedTheme === "dark");
        setThemeReady(true);
        return;
      }

      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
      setThemeReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }

    window.localStorage.setItem("narawit-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeReady]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="site-shell min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col md:flex-row bg-grid-dots relative antialiased">
        <div className="absolute inset-0 bg-grid-wireframe pointer-events-none opacity-50 z-0" />
        <div className="absolute inset-0 dossier-texture pointer-events-none z-0" />

        {/* Sidebar Navigation (Visible on Desktop) */}
        <Sidebar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenContact={() => setIsDrawerOpen(true)}
        />

        {/* Mobile Header (Visible on Mobile only) */}
        <MobileHeader
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenContact={() => setIsDrawerOpen(true)}
        />

        {/* Main Content Blueprint Layout */}
        <div className="grow flex flex-col justify-between min-h-screen">
          <div className="grow z-10 flex flex-col">
            {/* Section 0: Hero & Profile Image Split Grid */}
            <IntroSection onOpenContact={() => setIsDrawerOpen(true)} />

            {/* Section 1: Selected Projects Grid */}
            <ProjectsSection />

            {/* Section 2: Tech Stack Matrix */}
            <TechStack />
          </div>

          {/* Footer */}
          <Footer onOpenContact={() => setIsDrawerOpen(true)} />
        </div>

        <ContactDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

        {/* Global Toast Controller */}
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}
