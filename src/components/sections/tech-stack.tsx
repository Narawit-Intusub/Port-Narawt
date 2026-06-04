"use client";

import { useState, useEffect } from "react";
import {
  SiEspressif,
  SiArduino,
  SiCplusplus,
  SiMqtt,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiShadcnui,
  SiNodedotjs,
  SiNestjs,
  SiExpress,
  SiPostgresql,
  SiMysql,
  SiGit,
  SiGithub,
  SiGitlab,
  SiGo,
  SiLinux,
  SiFigma
} from "react-icons/si";
import {
  LuCircuitBoard,
  LuLayoutDashboard,
  LuDatabase,
  LuLayers,
  LuKanban,
  LuCpu,
  LuCode,
  LuWifi,
  LuSettings,
  LuMicrochip
} from "react-icons/lu";
import { MdSensors } from "react-icons/md";
import { TbApi } from "react-icons/tb";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Consolidated Professional Technical Stack Data (Focusing on Seniority)
const techStack = [
  {
    category: "Embedded & IoT",
    items: [
      "ESP32",
      "STM32",
      "Arduino Platform",
      "Embedded C/C++",
      "Hardware-Software Integration",
      "Sensors & Actuators",
      "MQTT / Broker"
    ]
  },
  {
    category: "Frontend Engineering",
    items: [
      "Next.js",
      "React.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Shadcn/UI",
      "Dashboard Design"
    ]
  },
  {
    category: "Backend & Databases",
    items: [
      "Node.js",
      "NestJS",
      "Express.js",
      "Go",
      "RESTful APIs",
      "PostgreSQL",
      "MySQL",
      "SQL",
      "NoSQL"
    ]
  },
  {
    category: "Tools & Competencies",
    items: [
      "Git",
      "GitHub",
      "GitLab",
      "Linux Systems",
      "Figma",
      "Full-Stack Architecture",
    ]
  }
];

// React Icons for Tech Stack Items
const itemIcons: Record<string, React.ReactNode> = {
  // Embedded & IoT
  "ESP32": <SiEspressif className="size-3.5 text-[#E18A66] shrink-0" />,
  "STM32": <LuMicrochip className="size-3.5 text-[#00599C] shrink-0" />,
  "Arduino Platform": <SiArduino className="size-3.5 text-[#00979D] shrink-0" />,
  "Embedded C/C++": <SiCplusplus className="size-3.5 text-[#00599C] shrink-0" />,
  "Hardware-Software Integration": <LuCircuitBoard className="size-3.5 text-[#E18A66] shrink-0" />,
  "Sensors & Actuators": <MdSensors className="size-3.5 text-[#E18A66] shrink-0" />,
  "MQTT / Broker": <SiMqtt className="size-3.5 text-[#660066] shrink-0" />,

  // Frontend Engineering
  "Next.js": <SiNextdotjs className="size-3.5 text-foreground dark:text-white shrink-0" />,
  "React.js": <SiReact className="size-3.5 text-[#58C4DC] shrink-0" />,
  "TypeScript": <SiTypescript className="size-3.5 text-[#3178C6] shrink-0" />,
  "JavaScript": <SiJavascript className="size-3.5 text-[#F7DF1E] rounded-sm bg-black shrink-0" />,
  "Tailwind CSS": <SiTailwindcss className="size-3.5 text-[#38BDF8] shrink-0" />,
  "Shadcn/UI": <SiShadcnui className="size-3.5 text-foreground dark:text-white shrink-0" />,
  "Dashboard Design": <LuLayoutDashboard className="size-3.5 text-[#034694] dark:text-[#4A8EE6] shrink-0" />,

  // Backend & Databases
  "Node.js": <SiNodedotjs className="size-3.5 text-[#339933] shrink-0" />,
  "NestJS": <SiNestjs className="size-3.5 text-[#E0234E] shrink-0" />,
  "Express.js": <SiExpress className="size-3.5 text-foreground dark:text-white shrink-0" />,
  "Go": <SiGo className="size-3.5 text-[#00ADD8] shrink-0" />,
  "RESTful APIs": <TbApi className="size-3.5 text-muted-foreground shrink-0" />,
  "PostgreSQL": <SiPostgresql className="size-3.5 text-[#336791] shrink-0" />,
  "MySQL": <SiMysql className="size-3.5 text-[#00758F] shrink-0" />,
  "SQL": <LuDatabase className="size-3.5 text-[#00758F] shrink-0" />,
  "NoSQL": <LuDatabase className="size-3.5 text-[#E0234E] shrink-0" />,

  // Tools & Competencies
  "Git": <SiGit className="size-3.5 text-[#F05032] shrink-0" />,
  "GitHub": <SiGithub className="size-3.5 text-foreground dark:text-white shrink-0" />,
  "GitLab": <SiGitlab className="size-3.5 text-[#FC6D26] shrink-0" />,
  "Linux Systems": <SiLinux className="size-3.5 text-foreground dark:text-white shrink-0" />,
  "Figma": <SiFigma className="size-3.5 text-[#F24E1E] shrink-0" />,
  "Full-Stack Architecture": <LuLayers className="size-3.5 text-[#034694] dark:text-[#4A8EE6] shrink-0" />,
};

// Colors and accents for category cards to make them pop elegantly
const categoryAccents: Record<string, { border: string; text: string; bg: string }> = {
  "Embedded & IoT": {
    border: "hover:ring-[#E18A66]/40 ring-foreground/10",
    text: "text-[#E18A66]",
    bg: "hover:bg-[#E18A66]/[0.01]"
  },
  "Frontend Engineering": {
    border: "hover:ring-[#034694]/40 ring-foreground/10",
    text: "text-[#034694] dark:text-[#4A8EE6]",
    bg: "hover:bg-[#034694]/[0.01]"
  },
  "Backend & Databases": {
    border: "hover:ring-[#0F8F67]/40 ring-foreground/10",
    text: "text-[#0F8F67]",
    bg: "hover:bg-[#0F8F67]/[0.01]"
  },
  "Tools & Competencies": {
    border: "hover:ring-[#DBA111]/40 ring-foreground/10",
    text: "text-[#DBA111]",
    bg: "hover:bg-[#DBA111]/[0.01]"
  }
};

// Helper function to dynamically resolve category headers to appropriate icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Embedded & IoT":
      return <LuCpu className="size-4" />;
    case "Frontend Engineering":
      return <LuCode className="size-4" />;
    case "Backend & Databases":
      return <LuWifi className="size-4" />;
    case "Tools & Competencies":
    default:
      return <LuSettings className="size-4" />;
  }
};

// Helper to calculate progress percentage
const getProgressValue = (value: number, min: number, max: number) => {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

export function TechStack() {
  const [telemetry, setTelemetry] = useState({
    coreTemp: 42.0,
    heapAlloc: 72.0,
    wifiRssi: -54
  });

  const [logs, setLogs] = useState<string[]>([
    "[BOOT] RTC init: SUCCESS",
    "[WIFI] Connected: Narawit-5G",
    "[MQTT] Handshake: ACK",
    "[RTOS] Task scheduler: ACTIVE",
    "[I2C] LSM6DS3: Calibration complete"
  ]);

  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setTelemetry((prev) => {
        const tempDiff = (Math.random() - 0.5) * 1.5;
        const newTemp = Math.max(38.0, Math.min(52.0, prev.coreTemp + tempDiff));

        const heapDiff = (Math.random() - 0.5) * 1.0;
        const newHeap = Math.max(68.0, Math.min(76.0, prev.heapAlloc + heapDiff));

        const rssiDiff = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newRssi = Math.max(-60, Math.min(-46, prev.wifiRssi + rssiDiff));

        return {
          coreTemp: parseFloat(newTemp.toFixed(1)),
          heapAlloc: parseFloat(newHeap.toFixed(1)),
          wifiRssi: Math.round(newRssi)
        };
      });
    }, 1500);

    const logPool = [
      "[MQTT] Publish: telemetry/state -> ACTIVE",
      "[RTOS] CPU core 0: Watchdog OK",
      "[RTOS] CPU core 1: MQTT loop active",
      "[SENSOR] DHT22: reading temp/humidity",
      "[SYSTEM] Tasks status check: OK",
      "[SYSTEM] Free heap memory updated",
      "[WIFI] Beacon signal strength stable",
      "[MQTT] Recv subscription heartbeat: ACK",
      "[GPIO] Low-level interface check: READY",
      "[RTOS] Heap compacting completed"
    ];

    const logsInterval = setInterval(() => {
      setLogs((prev) => {
        const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const newLog = `[${timestamp}] ${randomLog}`;
        return [...prev.slice(1), newLog];
      });
    }, 3500);

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(logsInterval);
    };
  }, []);

  return (
    <section id="stack" className="grid md:grid-cols-12 section-band">
      {/* Left Column: Tech Stack Matrix */}
      <div className="md:col-span-8 p-6 md:p-12 lg:p-14 flex flex-col gap-6 w-full md:border-r border-border/20">
        <div className="flex items-baseline justify-between pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold">02 / Stack</span>
              <span className="h-px w-6 bg-accent/40" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Tech Stack
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">Skills Directory</span>
        </div>
        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {techStack.map((stack, idx) => {
            const accent = categoryAccents[stack.category] || {
              border: "hover:ring-primary/40 ring-foreground/10",
              text: "text-primary",
              bg: "hover:bg-primary/[0.01]"
            };

            return (
              <Card
                key={idx}
                className={`group relative backdrop-blur-md ${accent.bg} ${accent.border} transition-all duration-300`}
              >
                {/* Decorative border line on hover */}
                <div className={`absolute top-0 inset-x-0 h-[2px] rounded-t-lg opacity-0 group-hover:opacity-100 bg-current ${accent.text}`} />

                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={accent.text}>
                        {getCategoryIcon(stack.category)}
                      </span>
                      <h3 className="font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                        {stack.category}
                      </h3>
                    </div>
                    <span className="size-1.5 rounded-full bg-border/30 group-hover:bg-emerald-500 shrink-0 transition-colors duration-300" />
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {stack.items.map(item => {
                      const icon = itemIcons[item];
                      return (
                        <Badge
                          key={item}
                          variant="outline"
                          className="gap-1.5 px-2.5 py-1.5 h-auto rounded-md bg-muted/40 hover:border-foreground/20 hover:bg-muted/70 text-foreground/80 hover:text-foreground font-medium"
                        >
                          {icon ? icon : <span className="size-1 rounded-full bg-border shrink-0" />}
                          <span>{item}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Right Column: Telemetry Diagnostics Console */}
      <div className="md:col-span-4 p-6 md:p-12 lg:p-14 flex flex-col gap-5 justify-start bg-card/5 select-none w-full">
        <div className="flex flex-col gap-1 pb-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-accent uppercase tracking-wider">Diagnostics</span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[8px] text-emerald-500 uppercase tracking-widest">ONLINE</span>
            </div>
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            System Telemetry
          </h3>
        </div>
        <Separator />

        {/* System Specs */}
        <Card className="bg-card/30 backdrop-blur-md">
          <CardContent className="flex flex-col gap-3 font-mono text-[10px] text-muted-foreground">
            <div className="flex justify-between pb-1">
              <span>CORE_MCU:</span>
              <span className="text-foreground font-semibold">ESP32-WROOM-32D</span>
            </div>
            <Separator />
            <div className="flex justify-between pb-1">
              <span>FIRMWARE:</span>
              <span className="text-foreground font-semibold">RTOS-v1.4.2</span>
            </div>
            <Separator />
            <div className="flex justify-between pb-1">
              <span>IOT_BROKER:</span>
              <span className="text-foreground font-semibold">mqtt.narawit.dev</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>BAUD_RATE:</span>
              <span className="text-foreground font-semibold">115200 bps</span>
            </div>
          </CardContent>
        </Card>

        {/* Resources / Progress Bar Indicators */}
        <Card className="bg-card/30 backdrop-blur-md">
          <CardContent className="flex flex-col gap-4 font-mono text-[10px] text-muted-foreground">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>CORE_TEMP:</span>
                <span className="text-foreground">{telemetry.coreTemp}°C</span>
              </div>
              <Progress value={getProgressValue(telemetry.coreTemp, 24, 60)} className="h-1.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>HEAP_ALLOC:</span>
                <span className="text-foreground">{telemetry.heapAlloc}%</span>
              </div>
              <Progress value={getProgressValue(telemetry.heapAlloc, 0, 100)} className="h-1.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>WIFI_RSSI:</span>
                <span className="text-foreground">{telemetry.wifiRssi} dBm</span>
              </div>
              <Progress value={getProgressValue(telemetry.wifiRssi, -90, -45)} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Monospace Log Box */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="font-mono text-[9px] text-muted-foreground/75 uppercase tracking-wider">Telemetry Serial Log</span>
          <div className="bg-[#05080E] text-[#4ea8de]/90 border border-border/10 p-3 rounded font-mono text-[9px] flex flex-col gap-1.5 leading-normal">
            <div className="text-neutral-500">$ screen /dev/ttyUSB0 115200</div>
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
