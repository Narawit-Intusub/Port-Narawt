"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon01Icon,
  Menu01Icon,
  Location01Icon,
  Clock01Icon,
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
import { navConfigs } from "@/components/config";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const iconMap: Record<string, any> = {
  Home01Icon,
  FolderSharedIcon,
  DatabaseIcon,
  GameController01Icon,
  ToyBrickIcon
};

interface MobileHeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenContact?: () => void;
}

export function MobileHeader({ darkMode, toggleDarkMode, onOpenContact }: MobileHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sidebar-shell md:hidden sticky top-0 z-40 text-white border-b transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={pathname === "/" ? "#intro" : "/"} className="flex items-center gap-2 group">
          <span className="font-serif text-lg font-bold tracking-tight select-none text-white">
            Narawit <span className="text-accent italic font-semibold">I.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer h-9 w-9"
            aria-label="Toggle Theme"
          >
            <HugeiconsIcon icon={darkMode ? Sun01Icon : Moon01Icon} className="size-4" />
          </Button>

          {/* Navigation Sheet Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer h-9 w-9"
                aria-label="Open Navigation Menu"
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="sidebar-shell border-l border-sidebar-border/30 text-sidebar-foreground w-72 p-6 flex flex-col justify-between bg-sidebar/95 backdrop-blur-md"
            >
              {/* Technical Corner Brackets */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-sidebar-border/40 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-sidebar-border/40 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-sidebar-border/40 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-sidebar-border/40 pointer-events-none" />

              <div className="flex flex-col gap-5 w-full items-stretch mt-4">
                {/* Brand / Logo Info */}
                <div className="w-full p-3 border border-sidebar-border/35 rounded bg-sidebar-foreground/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-6 h-px bg-accent/60" />
                  <div className="absolute top-0 right-0 w-px h-6 bg-accent/60" />

                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold tracking-tight text-sidebar-foreground">
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

                {/* Divider */}
                <div className="relative flex items-center justify-center my-0.5 select-none w-full">
                  <div className="w-full border-t border-dashed border-sidebar-border/30" />
                  <span className="absolute right-2 font-mono text-[7px] text-sidebar-foreground/35 px-1 bg-[#034694] dark:bg-[#021B42] select-none">
                    INDEX_SECTOR
                  </span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-4 w-full">
                  {navConfigs.map((group, groupIdx) => {
                    return (
                      <div key={groupIdx} className="flex flex-col gap-1.5 w-full">
                        {group.title && (
                          <div className="flex items-center justify-between px-1 w-full mt-1 mb-0.5">
                            <span className="font-mono text-[8px] text-accent uppercase tracking-widest font-semibold">
                              {group.title}
                            </span>
                            <span className="font-mono text-[7px] text-sidebar-foreground/45">
                              SEC_0{groupIdx}
                            </span>
                          </div>
                        )}
                        <ul className="flex flex-col font-mono text-[11px] uppercase tracking-widest text-sidebar-foreground w-full gap-1.5">
                          {group.subItems.map((item, itemIdx) => {
                            const id = item.href.replace(/^\/?#/, "").replace(/^\//, "") || "intro";
                            const isActive = (pathname === "/" && id === "intro" /* default fallback */) || 
                              (pathname !== "/" && item.activePattern.test(pathname));
                            
                            const IconComponent = iconMap[item.icon];
                            const num = `0${groupIdx * 3 + itemIdx}`;

                            return (
                              <li key={item.name} className="w-full">
                                <Link
                                  href={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-2 border rounded-md transition-all duration-300 group",
                                    isActive
                                      ? "border-sidebar-border/30 bg-sidebar-foreground/3 text-accent font-semibold"
                                      : "border-transparent hover:border-sidebar-border/20 hover:bg-sidebar-foreground/5 text-sidebar-foreground"
                                  )}
                                >
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
                                        "text-[8px] font-bold",
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
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-0.5 select-none w-full">
                  <div className="w-full border-t border-dashed border-sidebar-border/30" />
                  <span className="absolute right-2 font-mono text-[7px] text-sidebar-foreground/35 px-1 bg-[#034694] dark:bg-[#021B42] select-none">
                    METRIC_SECTOR
                  </span>
                </div>

                {/* Telemetry Loc */}
                <div className="border border-sidebar-border/25 rounded p-2.5 bg-sidebar-foreground/2 flex flex-col gap-2 w-full">
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[7px] text-sidebar-foreground/40 uppercase tracking-wider">Node Loc</span>
                      <HugeiconsIcon icon={Location01Icon} className="size-2.5 text-accent" />
                    </div>
                    <span className="font-sans text-[11px] font-semibold text-sidebar-foreground leading-normal">Bangkok, Thailand</span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Controls */}
              <div className="flex flex-col gap-3 w-full mt-auto pt-4">
                {onOpenContact && (
                  <Button
                    type="button"
                    variant="default"
                    className="h-9 w-full rounded border border-accent bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:bg-accent/90 relative overflow-hidden group cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenContact();
                    }}
                  >
                    <div className="absolute inset-0 w-1/2 bg-white/10 skew-x-12 translate-x-[-120%] group-hover:translate-x-[240%] transition-transform duration-1000 ease-out" />
                    <HugeiconsIcon icon={Message01Icon} className="size-3 mr-1.5" />
                    <span>Contact Me</span>
                  </Button>
                )}

                <div className="flex items-center justify-between border-t border-sidebar-border/35 pt-3 w-full">
                  {/* GitHub Link */}
                  <a
                    href="https://github.com/Narawit-Intusub"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded border border-sidebar-border/25 bg-sidebar-foreground/5 hover:bg-sidebar-foreground/15 hover:text-accent hover:border-accent/30 transition-all duration-300 text-sidebar-foreground flex items-center justify-center p-1.5"
                    aria-label="GitHub"
                  >
                    <HugeiconsIcon icon={GithubIcon} className="size-3.5" />
                  </a>

                  {/* Bangkok Clock Telemetry */}
                  <BangkokClock />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

