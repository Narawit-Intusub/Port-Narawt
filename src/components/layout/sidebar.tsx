"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Clock01Icon,
  Location01Icon,
  Message01Icon,
  GithubIcon,
  Home01Icon,
  FolderSharedIcon,
  DatabaseIcon,
  GameController01Icon,
  ToyBrickIcon
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { BangkokClock } from "@/components/bangkok-clock";
import { cn } from "@/lib/utils";
import { navConfigs } from "@/components/config";

const iconMap: Record<string, any> = {
  Home01Icon,
  FolderSharedIcon,
  DatabaseIcon,
  GameController01Icon,
  ToyBrickIcon
};

interface SidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenContact: () => void;
}

export function Sidebar({ darkMode, toggleDarkMode, onOpenContact }: SidebarProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const pathname = usePathname();

  // Scroll Spy implementation using IntersectionObserver
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["intro", "projects", "stack"];
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -40% 0px", // Trigger when section is in the upper-mid view
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/arcade") {
      setActiveSection("arcade");
    }
  }, [pathname]);



  return (
    <aside className={cn(
      "sidebar-shell hidden md:flex h-screen sticky top-0 text-sidebar-foreground border-r border-sidebar-border/30 flex-col justify-between z-40 shrink-0 transition-all duration-300 ease-in-out select-none backdrop-blur-md bg-sidebar/85",
      isSidebarCollapsed ? "w-16 px-2 py-4 items-center" : "w-52 lg:w-56 p-4"
    )}>
      {/* Technical Corner Brackets */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-sidebar-border/40 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-sidebar-border/40 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-sidebar-border/40 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-sidebar-border/40 pointer-events-none" />

      <div className={cn("flex flex-col gap-4 w-full", isSidebarCollapsed ? "items-center" : "items-stretch")}>
        {/* Logo area / Engineering Badge */}
        <a href="#intro" className={cn("flex flex-col gap-1 group relative", isSidebarCollapsed ? "items-center" : "items-start w-full")}>
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center justify-center size-9 border border-sidebar-border/35 rounded bg-sidebar-foreground/5 relative overflow-hidden group hover:border-accent/40 transition-all duration-300">
              <span className="font-serif text-lg font-bold tracking-tight text-sidebar-foreground select-none group-hover:scale-105 transition-transform duration-300">
                N<span className="text-accent italic font-semibold">.</span>
              </span>
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ) : (
            <div className="w-full p-3 border border-sidebar-border/35 rounded bg-sidebar-foreground/5 relative overflow-hidden group hover:border-accent/40 transition-all duration-300">
              {/* Technical glowing dot & header details */}
              <div className="absolute top-0 right-0 w-6 h-px bg-accent/60" />
              <div className="absolute top-0 right-0 w-px h-6 bg-accent/60" />
              
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg lg:text-xl font-bold tracking-tight text-sidebar-foreground transition-all duration-300">
                  Narawit <span className="text-accent italic font-semibold">I.</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[7px] text-emerald-400 font-semibold tracking-wider">LIVE</span>
                </div>
              </div>
              <span className="block font-mono text-[8px] text-sidebar-foreground/75 uppercase tracking-widest leading-none mt-1">
                Developer & Engineer
              </span>
              <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-sidebar-border/20">
                <span className="font-mono text-[7px] text-sidebar-foreground/40 font-medium">SYS_STATUS</span>
                <span className="font-mono text-[7px] text-accent font-semibold">ACTIVE</span>
              </div>
            </div>
          )}
        </a>

        {/* Modular Tech Divider */}
        <div className="relative flex items-center justify-center my-0.5 select-none w-full">
          <div className="w-full border-t border-dashed border-sidebar-border/30" />
          {!isSidebarCollapsed && (
            <span className="absolute right-2 font-mono text-[7px] text-sidebar-foreground/35 px-1 bg-sidebar select-none">
              INDEX_SECTOR
            </span>
          )}
        </div>

        {/* Nav Menu Links */}
        <nav className={cn("flex flex-col gap-4 w-full", isSidebarCollapsed ? "items-center" : "")}>
          {navConfigs.map((group, groupIdx) => {
            const hasTitle = group.title && !isSidebarCollapsed;
            return (
              <div key={groupIdx} className="flex flex-col gap-1.5 w-full">
                {hasTitle && (
                  <div className="flex items-center justify-between px-1 w-full mt-1.5 mb-0.5">
                    <span className="font-mono text-[8px] text-accent uppercase tracking-widest font-semibold">
                      {group.title}
                    </span>
                    <span className="font-mono text-[7px] text-sidebar-foreground/45">
                      SEC_0{groupIdx}
                    </span>
                  </div>
                )}
                <ul className={cn(
                  "flex flex-col font-mono text-[11px] uppercase tracking-widest text-sidebar-foreground w-full",
                  isSidebarCollapsed ? "gap-3 items-center" : "gap-1.5"
                )}>
                  {group.subItems.map((item, itemIdx) => {
                    const id = item.href.replace(/^\/?#/, "").replace(/^\//, "") || "intro";
                    const isActive = (pathname === "/" && activeSection === id) || 
                      (pathname !== "/" && item.activePattern.test(pathname));
                    
                    const IconComponent = iconMap[item.icon];
                    const num = `0${groupIdx * 3 + itemIdx}`;

                    return (
                      <li key={item.name} className={cn("flex justify-center", !isSidebarCollapsed && "w-full")}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center relative transition-all duration-300 group py-2 rounded-md",
                            isSidebarCollapsed 
                              ? "justify-center size-9 border border-sidebar-border/20 bg-sidebar-foreground/5 hover:bg-sidebar-foreground/10 hover:border-accent/40" 
                              : "px-2.5 border border-transparent hover:border-sidebar-border/20 hover:bg-sidebar-foreground/5 w-full",
                            isActive && (isSidebarCollapsed 
                              ? "border-accent bg-accent/15 text-accent" 
                              : "border-sidebar-border/30 bg-sidebar-foreground/3 text-accent font-semibold")
                          )}
                        >
                          {/* Left neon indicator for active items */}
                          {!isSidebarCollapsed && isActive && (
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-accent" />
                          )}

                          {isSidebarCollapsed ? (
                            IconComponent ? (
                              <HugeiconsIcon icon={IconComponent} className="size-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{num}</span>
                            )
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                {IconComponent ? (
                                  <HugeiconsIcon 
                                    icon={IconComponent} 
                                    className={cn(
                                      "size-3.5 transition-colors duration-300", 
                                      isActive ? "text-accent" : "text-sidebar-foreground/50 group-hover:text-accent"
                                    )} 
                                  />
                                ) : (
                                  <span className={cn(
                                    "text-[8px] transition-colors duration-300 font-bold", 
                                    isActive ? "text-accent" : "text-sidebar-foreground/40 group-hover:text-accent"
                                  )}>
                                    {num}
                                  </span>
                                )}
                                <span className="group-hover:translate-x-1 transition-transform duration-300 ease-out">
                                  {item.name}
                                </span>
                              </div>
                              {isActive ? (
                                <span className="font-mono text-[8px] text-accent animate-pulse font-bold">▶</span>
                              ) : (
                                <span className="font-mono text-[8px] text-sidebar-foreground/0 group-hover:text-sidebar-foreground/25 transition-colors duration-200">_</span>
                              )}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Modular Tech Divider */}
        <div className="relative flex items-center justify-center my-0.5 select-none w-full">
          <div className="w-full border-t border-dashed border-sidebar-border/30" />
          {!isSidebarCollapsed && (
            <span className="absolute right-2 font-mono text-[7px] text-sidebar-foreground/35 px-1 bg-sidebar select-none">
              METRIC_SECTOR
            </span>
          )}
        </div>

        {/* Telemetry panel (Coordinates & Bangkok Clock) */}
        <div className={cn("flex flex-col gap-2 w-full", isSidebarCollapsed ? "items-center" : "")}>
          {isSidebarCollapsed ? (
            <div className="flex flex-col gap-2 items-center w-full">
              <div className="size-8 rounded border border-sidebar-border/20 bg-sidebar-foreground/5 flex items-center justify-center text-accent transition-colors duration-300 hover:border-accent/45 cursor-help" title="Location: Bangkok">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
              </div>
              <div className="size-8 rounded border border-sidebar-border/20 bg-sidebar-foreground/5 flex items-center justify-center text-accent transition-colors duration-300 hover:border-accent/45 animate-pulse cursor-help" title="Local Time">
                <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
              </div>
            </div>
          ) : (
            <div className="border border-sidebar-border/25 rounded p-2.5 bg-sidebar-foreground/2 flex flex-col gap-2 w-full">
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[7px] text-sidebar-foreground/40 uppercase tracking-wider">Node Loc</span>
                  <HugeiconsIcon icon={Location01Icon} className="size-2.5 text-accent" />
                </div>
                <span className="font-sans text-[11px] font-semibold text-sidebar-foreground leading-normal">Bangkok, Thailand</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className={cn("flex flex-col gap-3 w-full", isSidebarCollapsed ? "items-center" : "")}>
        {isSidebarCollapsed ? (
          <Button
            type="button"
            variant="default"
            className="size-8 rounded border border-sidebar-border/30 bg-accent text-accent-foreground transition-all duration-300 hover:scale-[1.05] hover:bg-accent/90 flex items-center justify-center p-0 cursor-pointer"
            aria-label="Contact"
            onClick={onOpenContact}
          >
            <HugeiconsIcon icon={Message01Icon} className="size-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            className="h-9 w-full rounded border border-accent bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:bg-accent/90 relative overflow-hidden group cursor-pointer"
            onClick={onOpenContact}
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 w-1/2 bg-white/10 skew-x-12 translate-x-[-120%] group-hover:translate-x-[240%] transition-transform duration-1000 ease-out" />
            <HugeiconsIcon icon={Message01Icon} className="size-3 mr-1.5" />
            <span>Contact Me</span>
          </Button>
        )}

        <div className={cn(
          "flex border-t border-sidebar-border/35 pt-3 w-full",
          isSidebarCollapsed ? "flex-col items-center gap-2" : "items-center justify-between"
        )}>
          {/* GitHub Link */}
          <a
            href="https://github.com/Narawit-Intusub"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "rounded border border-sidebar-border/25 bg-sidebar-foreground/5 hover:bg-sidebar-foreground/15 hover:text-accent hover:border-accent/30 transition-all duration-300 text-sidebar-foreground flex items-center justify-center",
              isSidebarCollapsed ? "size-8" : "p-1.5"
            )}
            aria-label="GitHub"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-3.5" />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              "rounded border border-sidebar-border/25 bg-sidebar-foreground/5 hover:bg-sidebar-foreground/15 hover:text-accent hover:border-accent/30 transition-all duration-300 text-sidebar-foreground hover:scale-105 flex items-center justify-center cursor-pointer",
              isSidebarCollapsed ? "size-8" : "p-1.5"
            )}
            aria-label="Toggle Theme"
          >
            <HugeiconsIcon icon={darkMode ? Sun01Icon : Moon01Icon} className="size-3.5" />
          </button>

          {/* Sidebar Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              "rounded border border-sidebar-border/25 bg-sidebar-foreground/5 hover:bg-sidebar-foreground/15 hover:text-accent hover:border-accent/30 transition-all duration-300 text-sidebar-foreground hover:scale-105 flex items-center justify-center cursor-pointer",
              isSidebarCollapsed ? "size-8" : "p-1.5"
            )}
            aria-label="Collapse Sidebar"
          >
            <HugeiconsIcon icon={isSidebarCollapsed ? ArrowRight01Icon : ArrowLeft01Icon} className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

