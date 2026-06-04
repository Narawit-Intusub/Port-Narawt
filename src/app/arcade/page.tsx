"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GameController01Icon,
  ToyBrickIcon,
  GamepadIcon,
  LockIcon,
  MonitorDotIcon,
  PlayIcon,
  PaintBrush01Icon
} from "@hugeicons/core-free-icons";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { ContactDrawer } from "@/components/contact-drawer";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: typeof GameController01Icon;
  path: string;
  status: 'playable' | 'locked';
  genre: string;
}

const games: Game[] = [
  {
    id: 'claw-machine',
    title: 'Claw Machine',
    description: 'คีบตุ๊กตาพิกเซลแสนน่ารักสุดคลาสสิก ทดสอบความแม่นยำและจังหวะของคุณ!',
    icon: GameController01Icon,
    path: '/arcade/games/claw-machine',
    status: 'playable',
    genre: 'Casual Arcade',
  },
  {
    id: 'little-pilot',
    title: 'Little Pilot',
    description: 'เกมขับเครื่องบินยิงต่อสู้พิกเซลสุดเร้าใจ ทะยานฝ่าด่านศัตรูเพื่อคว้าคะแนนสูงสุด!',
    icon: GamepadIcon,
    path: '/arcade/games/little-pilot',
    status: 'playable',
    genre: 'Retro Shooter',
  },
  {
    id: 'hand-pen',
    title: 'Hand Pen',
    description: 'วาดภาพกลางอากาศด้วยมือของคุณผ่านกล้องเว็บแคม! กด Shift ค้างเพื่อเริ่มวาด และ Spacebar เพื่อล้างหน้าจอ',
    icon: PaintBrush01Icon,
    path: '/arcade/games/hand-pen',
    status: 'playable',
    genre: 'AI Gesture & Art',
  },
  {
    id: 'tetris',
    title: 'Retro Tetris',
    description: 'เกมต่อบล็อกระดับตำนาน เรียงแถวให้เคลียร์เพื่อคว้าคะแนนสูงสุดระดับพระกาฬ',
    icon: ToyBrickIcon,
    path: '/arcade/games/tetris',
    status: 'playable',
    genre: 'Classic Puzzle',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    description: 'ปกป้องระบบจากยานอวกาศผู้บุกรุกต่างดาวในสงครามเหนือน่านฟ้าพิกเซล',
    icon: GamepadIcon,
    path: '#',
    status: 'locked',
    genre: 'Retro Shooter',
  }
];

export default function ArcadeLobby() {
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
    if (!themeReady) return;
    window.localStorage.setItem("narawit-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeReady]);



  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="site-shell min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col md:flex-row bg-grid-dots relative antialiased">
        <div className="absolute inset-0 bg-grid-wireframe pointer-events-none opacity-50 z-0" />
        <div className="absolute inset-0 dossier-texture pointer-events-none z-0" />

        {/* Sidebar Navigation */}
        <Sidebar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenContact={() => setIsDrawerOpen(true)}
        />

        {/* Mobile Header */}
        <MobileHeader
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenContact={() => setIsDrawerOpen(true)}
        />

        {/* Content Wrapper */}
        <div className="grow flex flex-col justify-between min-h-screen z-10 relative">
          <div className="grow flex flex-col p-6 md:p-12 lg:p-14 w-full animate-fade-in-up">
            
            {/* Header / Intro Band */}
            <div className="flex flex-col gap-1 pb-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold">02 / Entertainment</span>
                <span className="h-px w-6 bg-accent/40" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground uppercase font-sans">
                    Narawit Arcade
                  </h1>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 max-w-2xl font-medium">
                    พื้นที่รวบรวมมินิเกมย้อนยุคสุดคลาสสิกที่พัฒนาด้วยโค้ดเว็บ สัมผัสความสนุกแบบ Retro อาเขตได้ทันที!
                  </p>
                </div>
                

              </div>
              <Separator className="mt-4" />
            </div>

            {/* Main Interactive Grid */}
            <div className="flex flex-col gap-6 w-full">
              
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={MonitorDotIcon} className="size-3.5 text-accent" />
                  Game Selection
                </h2>
                <span className="text-[9px] font-mono text-muted-foreground/60">SELECT GAME TO INITIATE</span>
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {games.map((game) => {
                  const isPlayable = game.status === 'playable';

                  const GameCard = (
                    <Card 
                      className={`group relative flex flex-col h-full backdrop-blur-md transition-all duration-300 ${
                        isPlayable ? 'hover:ring-accent/40 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(219,161,17,0.08)]' : 'opacity-40 cursor-not-allowed select-none'
                      }`}
                    >
                      <CardHeader>
                        {/* Card Subtitle/Header */}
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="font-mono text-[8.5px] tracking-wider">
                            {game.genre}
                          </Badge>
                          
                          {/* Playable status */}
                          {isPlayable ? (
                            <span className="flex items-center gap-1.5">
                              <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-[8.5px] font-mono text-emerald-500 font-bold tracking-wider">READY</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground/60 text-[8.5px] font-mono font-semibold">
                              <HugeiconsIcon icon={LockIcon} className="size-2.5" />
                              LOCKED
                            </span>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-4 grow">
                        {/* Game Icon */}
                        <div 
                          className={`size-12 rounded-lg border border-border bg-card/80 flex items-center justify-center transition-all duration-300 ${
                            isPlayable ? 'group-hover:border-accent/40 group-hover:bg-accent/5' : ''
                          }`}
                        >
                          <HugeiconsIcon icon={game.icon} className={`size-6 transition-colors duration-300 ${
                            isPlayable ? 'text-accent group-hover:text-accent' : 'text-muted-foreground'
                          }`} />
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
                          {game.title}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                          {game.description}
                        </p>
                      </CardContent>

                      {/* Action play button */}
                      <CardFooter>
                        {isPlayable ? (
                          <Button className="w-full font-mono text-[10px] tracking-widest uppercase bg-accent text-accent-foreground hover:bg-accent/90">
                            <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
                            START GAME
                          </Button>
                        ) : (
                          <Button variant="outline" disabled className="w-full font-mono text-[10px] tracking-widest uppercase">
                            <HugeiconsIcon icon={LockIcon} data-icon="inline-start" />
                            COMING SOON
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );

                  return isPlayable ? (
                    <Link 
                      href={game.path} 
                      key={game.id} 
                      className="group flex flex-col h-full"
                    >
                      {GameCard}
                    </Link>
                  ) : (
                    <div key={game.id} className="flex flex-col h-full">
                      {GameCard}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <Footer onOpenContact={() => setIsDrawerOpen(true)} />
        </div>

        {/* Drawer & Toaster */}
        <ContactDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}