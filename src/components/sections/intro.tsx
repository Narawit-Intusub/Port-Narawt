"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import { Cpu, Code2, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const profileStats = [
  { label: "Core", value: "Computer Engineering", icon: "⚙" },
  { label: "Builds", value: "Web + Embedded Systems", icon: "◈" },
  { label: "Base", value: "Bangkok, GMT+7", icon: "◉" }
];

interface IntroSectionProps {
  onOpenContact: () => void;
}

export function IntroSection({ onOpenContact }: IntroSectionProps) {
  return (
    <section id="intro" className="grid min-h-[calc(100vh-72px)] md:min-h-screen md:grid-cols-12 section-band overflow-hidden">
      {/* Left Column: Hero Text */}
      <div className="hero-copy order-2 md:order-1 md:col-span-7 p-6 md:p-12 lg:p-16 flex flex-col gap-7 justify-center relative">
        {/* Subtle decorative line */}
        <div className="absolute top-0 left-6 md:left-12 lg:left-16 w-px h-16 bg-linear-to-b from-primary/40 to-transparent" />

        <div className="flex flex-wrap items-center gap-2.5 animate-fade-in-up">
          <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/8 font-mono text-[9px] uppercase text-accent tracking-wider px-3 py-0.5">
            CE Portfolio 2026
          </Badge>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
            Developer dossier
          </span>
        </div>

        <div className="status-chip flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border/60 bg-card/40 w-fit animate-fade-in-up backdrop-blur-sm" style={{ animationDelay: "0.05s" }}>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground/80">
            Available for opportunities
          </span>
        </div>

        <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.02]">
            Hi, I&apos;m{" "}
            <span className="relative inline-block">
              <span className="italic font-serif text-primary font-normal">Narawit</span>
              <span className="absolute -bottom-1 left-0 w-full h-px bg-linear-to-r from-primary/40 to-transparent" />
            </span>
          </h1>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
            Computer Engineering · Full-stack Developer
          </p>
        </div>

        <p className="text-sm md:text-base text-muted-foreground/80 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Computer Engineering graduate from Naresuan University with a solid foundation in hardware and software. Motivated to begin as a Junior Engineer, continuously develop technical expertise, and grow into a Senior role while contributing to organizational success.
        </p>

        <div className="grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          {profileStats.map((stat) => (
            <div key={stat.label} className="stat-tile group border border-border/50 bg-card/30 backdrop-blur-sm p-3.5 rounded-lg hover:bg-card/50 hover:border-border/70 transition-all duration-300">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-accent/70">{stat.icon}</span>
                <span className="block font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60">
                  {stat.label}
                </span>
              </div>
              <span className="block text-xs font-medium leading-snug text-foreground/90">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile Quick Info Box (Visible on mobile only) */}
        <div className="md:hidden flex flex-col gap-3 p-4 border border-border/50 bg-card/30 backdrop-blur-sm rounded-lg font-mono text-[10px] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/60 tracking-wider">LOCATION:</span>
            <span className="font-semibold text-foreground/90">Bangkok, Thailand</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground/60 tracking-wider">TIMEZONE:</span>
            <span className="font-semibold text-foreground/90">Bangkok (GMT+7)</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-border/30 pt-2">
            <span className="text-muted-foreground/60 tracking-wider">CURRENT FOCUS:</span>
            <span className="font-serif italic text-foreground/90 text-xs leading-normal">Next.js 16 + ESP32 RTOS firmware development</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button asChild size="lg" className="h-10 rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
            <a href="#projects">
              ดูผลงาน / Projects
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 rounded-full px-5 border-border/60 bg-transparent hover:bg-card/50 transition-all duration-300"
            onClick={onOpenContact}
          >
            <HugeiconsIcon icon={Message01Icon} data-icon="inline-start" />
            ติดต่องาน / Contact
          </Button>
        </div>
      </div>

      {/* Right Column: Profile Image Block */}
      <div className="order-1 md:order-2 md:col-span-5 p-6 md:p-12 lg:p-14 flex flex-col justify-center select-none animate-fade-in-up relative" style={{ animationDelay: "0.15s" }}>
        {/* Subtle ambient glow behind the image area */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Floating Tech Badges (Only on larger screens for layout integrity, or responsive margins) */}
        <div className="w-full max-w-[340px] xs:max-w-[360px] lg:max-w-[380px] mx-auto relative z-10">
          <div className="preview-console mb-4 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-[0.15em]">
                Preview Plate
              </span>
              <span className="text-sm font-medium tracking-tight text-foreground/90">
                Developer Profile
              </span>
            </div>
            <Badge variant="outline" className="shrink-0 font-mono text-[9px] uppercase rounded-full border-border/40 px-2.5 text-muted-foreground/60">
              Active HUD
            </Badge>
          </div>

          {/* Concentric Blueprint Rings behind the image card */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 scale-105 md:scale-115 opacity-30 dark:opacity-40 pointer-events-none">
            <svg className="w-[120%] h-[120%] aspect-square" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outermost Dashed Tech Ring */}
              <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" className="text-primary/40 dark:text-primary/60" />
              {/* Secondary Solid Ring with Coordinate ticks */}
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.75" className="text-accent/30 dark:text-accent/40" />
              <path d="M100 5 L100 15 M100 185 L100 195 M5 100 L15 100 M185 100 L195 100" stroke="currentColor" strokeWidth="0.75" className="text-accent/30" />
              {/* Diagonal ticks */}
              <path d="M33 33 L40 40 M167 167 L160 160 M33 167 L40 160 M167 33 L160 40" stroke="currentColor" strokeWidth="0.5" className="text-primary/30" />
              {/* Tech Radar Crosshair Grid */}
              <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 4" className="text-muted-foreground/30" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 4" className="text-muted-foreground/30" />
              {/* Concentric circles */}
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" className="text-primary/30" />
              <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="0.25" className="text-muted-foreground/20" />
              {/* Tiny tech data labels */}
              <text x="105" y="25" fill="currentColor" className="text-[4px] font-mono text-accent/50">SYS_RADAR_0.1</text>
              <text x="105" y="180" fill="currentColor" className="text-[4px] font-mono text-primary/50">CE_GRID_SYS</text>
            </svg>
          </div>

          {/* Main Card Frame (Static) */}
          <div className="relative w-full aspect-square overflow-hidden bg-card/60 p-1.5 border border-border/50 rounded-xl shadow-lg">
            {/* Technical outer frame accents — Corner brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent" />

            {/* Profile Image container */}
            <div className="relative w-full h-full overflow-hidden rounded-lg bg-card/50">
              <Image
                src="/images/logo/image.png"
                alt="Narawit Intusub Profile"
                fill
                priority
                className="object-cover rounded-lg"
              />
              
              {/* Floating Glass Nameplate */}
              <div className="absolute bottom-3 left-3 right-3 bg-background/90 dark:bg-background/80 backdrop-blur-md border border-border/30 dark:border-border/15 py-2 px-3 rounded-lg flex items-center justify-between gap-2 z-10 shadow-md">
                <div className="flex flex-col">
                  <span className="font-serif italic text-[11px] font-semibold text-foreground/90 leading-none">Narawit Intusub</span>
                  <span className="font-mono text-[6.5px] uppercase tracking-widest text-muted-foreground/80 mt-0.5">Hardware &amp; Software Dev</span>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono text-[7px] bg-accent/15 border-accent/20 text-accent uppercase rounded px-1.5 py-0.5 font-bold">
                  DEV dossiers
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
