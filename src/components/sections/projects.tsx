"use client";

import { type CSSProperties } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    id: "01",
    title: "Automatic License Plate Recognition Barrier",
    subtitle: "Faculty of Engineering",
    category: "IoT & Computer Vision",
    status: "Completed Prototype",
    signal: "License Plate AI + Barrier Relay triggers",
    accent: "#E18A66",
    tags: ["Python", "OpenCV", "Arduino", "MySQL", "REST API", "Hardware Integration"],
    desc: "Collaborated with the team to develop both the hardware and software for an automated vehicle entry/exit system. Gained hands-on experience in hardware-software integration—connecting sensors, relays, and database systems—while strengthening teamwork and project management skills throughout the development lifecycle.",
    link: "https://github.com/Narawit-Intusub"
  },
  {
    id: "02",
    title: "Room Usage Dashboard Website",
    subtitle: "KNECC",
    category: "Web Development",
    status: "Production Ready",
    signal: "Real-time occupancy database logs",
    accent: "#0F8F67",
    tags: ["React.js", "Next.js", "JavaScript", "HTML/CSS", "MySQL", "REST API", "Data Visualization"],
    desc: "Developed a web-based dashboard for monitoring and managing room occupancy data in real time. Designed user-friendly interfaces and data visualization features to improve facility management efficiency. Implemented frontend and backend functionalities, including data management and reporting. Enhanced skills in web development, database design, and dashboard analytics.",
    link: "https://github.com/Narawit-Intusub"
  }
];

export function ProjectsSection() {
  return (
    <section id="projects" className="section-band border-b border-border/20">
      <div className="p-6 md:p-12 lg:p-14 flex flex-col justify-start w-full">
        <div className="flex items-baseline justify-between border-b border-border/20 pb-4 mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold">01 / Works</span>
              <span className="h-px w-6 bg-accent/40" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Project Ledger
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">Selected Work 01-02</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group border border-border/30 hover:border-border/60 bg-card/20 backdrop-blur-sm rounded-lg p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between relative"
              style={{
                "--project-accent": p.accent,
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)"
              } as CSSProperties}
            >
              {/* Top Accent Line */}
              <div 
                className="absolute top-0 inset-x-0 h-[2px] rounded-t-lg transition-all duration-300 opacity-60 group-hover:opacity-100"
                style={{ backgroundColor: p.accent }}
              />

              <div className="flex flex-col gap-4">
                {/* Header bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="project-index font-mono text-[10px] text-muted-foreground mt-0.5">{p.id}</span>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-xl font-medium tracking-tight text-foreground transition-colors duration-200">
                        {p.title}
                      </h3>
                      <span className="font-mono text-[10px] text-muted-foreground">{p.subtitle}</span>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[9px] uppercase">
                          {p.status}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.signal}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded border border-border bg-card/60 opacity-60 hover:opacity-100 hover:text-primary transition-all duration-200 cursor-pointer shrink-0"
                    aria-label={`Open repository for ${p.title}`}
                  >
                    <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
                  </a>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                  {p.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {p.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="font-mono text-[9px] lowercase bg-card/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
