"use client";
import { useEffect, useState } from "react";

interface TimeLeft { d: number; h: number; m: number; s: number }

function calc(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="relative w-[52px] sm:w-[60px] h-[52px] sm:h-[60px] rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* inner reflex */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), transparent 60%)" }}
      />
      <span className="relative font-syne font-black text-white tabular-nums text-xl sm:text-2xl leading-none">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <p className="text-[9px] uppercase tracking-[0.12em] text-white/40 font-outfit">{label}</p>
  </div>
);

export default function OrgCountdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calc(targetDate));
    const id = setInterval(() => setTime(calc(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2">
      <Unit value={time.d} label="Jours" />
      <span className="text-white/25 font-syne font-black text-lg mb-4 animate-pulse">:</span>
      <Unit value={time.h} label="Heures" />
      <span className="text-white/25 font-syne font-black text-lg mb-4 animate-pulse">:</span>
      <Unit value={time.m} label="Min" />
      <span className="text-white/25 font-syne font-black text-lg mb-4 animate-pulse">:</span>
      <Unit value={time.s} label="Sec" />
    </div>
  );
}
