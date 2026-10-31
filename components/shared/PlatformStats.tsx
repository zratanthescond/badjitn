"use client";

import { CalendarDays, Handshake, UserCheck, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PlatformStatsProps = {
  eventsCount: number;
  organisationsCount: number;
  participantsCount: number;
  categoriesCount: number;
};

type StatItem = {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  text: string;
  iconBg: string;
  iconColor: string;
  ring: string;
};

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function CountUp({ value, duration = 1600 }: { value: number; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("fr-FR")}
    </span>
  );
}

export default function PlatformStats({
  eventsCount,
  organisationsCount,
  participantsCount,
  categoriesCount,
}: PlatformStatsProps) {
  const stats: StatItem[] = [
    {
      label: "Événements organisés",
      value: eventsCount,
      suffix: "+",
      icon: CalendarDays,
      text: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-400/10",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      ring: "ring-indigo-500/20",
    },
    {
      label: "Organisations partenaires",
      value: organisationsCount,
      suffix: "+",
      icon: Handshake,
      text: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-400/10",
      iconColor: "text-sky-500 dark:text-sky-400",
      ring: "ring-sky-500/20",
    },
    {
      label: "Participants inscrits",
      value: participantsCount,
      suffix: "+",
      icon: UserCheck,
      text: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    {
      label: "Spécialités couvertes",
      value: categoriesCount,
      icon: Stethoscope,
      text: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-400/10",
      iconColor: "text-rose-500 dark:text-rose-400",
      ring: "ring-rose-500/20",
    },
  ];

  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-40 bg-elite-gradient opacity-[0.06] blur-3xl" />

      <div className="relative rounded-3xl border border-white/10 bg-white/5 dark:bg-elite-charcoal/40 backdrop-blur-2xl p-6 md:p-10 shadow-elite-soft overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-elite-violet/10 blur-[80px]" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-elite-cyan/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center text-center gap-2 mb-8 md:mb-10">
          <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] bg-clip-text text-transparent bg-elite-gradient">
            Badgi en chiffres
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-syne text-foreground">
            La référence des événements professionnels
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Chaque jour, de nouvelles organisations font confiance à Badgi pour créer,
            gérer et faire grandir leurs événements.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map(({ label, value, suffix, icon: Icon, text, iconBg, iconColor, ring }) => (
            <div
              key={label}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-elite-zinc/40 p-6 md:p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/10 overflow-hidden"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-2xl ${iconBg} ring-1 ${ring} transition-transform duration-500 group-hover:scale-110`}
              >
                <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.75} />
              </div>

              <div
                className={`flex items-baseline justify-center gap-1 font-outfit text-4xl md:text-5xl font-black leading-none tracking-tight ${text}`}
              >
                <CountUp value={value} />
                {suffix && <span className="text-2xl md:text-3xl font-bold">{suffix}</span>}
              </div>

              <p className="text-xs md:text-sm font-semibold text-muted-foreground text-center leading-snug uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
