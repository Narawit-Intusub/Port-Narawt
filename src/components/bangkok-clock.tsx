"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";

export function BangkokClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] text-white">
      <HugeiconsIcon icon={Clock01Icon} className="size-3 text-accent animate-pulse" />
      <span>BKK:</span>
      <span className="font-semibold text-white select-all">{time || "00:00:00"} (GMT+7)</span>
    </div>
  );
}
