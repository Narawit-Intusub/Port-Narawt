"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Linkedin01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenContact: () => void;
}

export function Footer({ onOpenContact }: FooterProps) {
  return (
    <footer className="footer-band bg-card">
      <div className="max-w-6xl mx-auto p-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="text-xs text-muted-foreground">© 2026 Narawit Intusub. All rights reserved.</p>
          <p className="text-[10px] font-mono text-muted-foreground">Designed with absolute minimalism & Chelsea Pride.</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenContact}
            aria-label="Open contact form"
          >
            <HugeiconsIcon icon={Mail01Icon} />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <HugeiconsIcon icon={Linkedin01Icon} />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://github.com/Narawit-Intusub"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <HugeiconsIcon icon={GithubIcon} />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
