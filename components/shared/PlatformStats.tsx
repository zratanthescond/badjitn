"use client";

import { CalendarCheck2, Building2, Users2, LayoutGrid } from "lucide-react";
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
  accent: string;
  glow: string;
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
      icon: CalendarCheck2,
      accent: "from-elite-violet to-elite-cyan",
      glow: "shadow-[0_0_30px_-8px_rgba(98,76,245,0.55)]",
    },
    {
      label: "Organisations partenaires",
      value: organisationsCount,
      suffix: "+",
      icon: Building2,
      accent: "from-elite-cyan to-coral-500",
      glow: "shadow-[0_0_30px_-8px_rgba(32,213,236,0.5)]",
    },
    {
      label: "Participants inscrits",
      value: participantsCount,
      suffix: "+",
      icon: Users2,
      accent: "from-coral-500 to-elite-violet",
      glow: "shadow-[0_0_30px_-8px_rgba(21,191,89,0.45)]",
    },
    {
      label: "Spécialités couvertes",
      value: categoriesCount,
      icon: LayoutGrid,
      accent: "from-elite-violet to-coral-500",
      glow: "shadow-[0_0_30px_-8px_rgba(98,76,245,0.5)]",
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
          {stats.map(({ label, value, suffix, icon: Icon, accent, glow }) => (
            <div
              key={label}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-elite-zinc/40 p-6 md:p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 overflow-hidden"
            >
              {/* Bottom accent bar, revealed on hover */}
              <div
                className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${accent} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />

              <div
                className={`flex items-center justify-center w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${accent} ${glow} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2} />
              </div>

              <div
                className={`flex items-baseline justify-center gap-1 font-syne text-4xl md:text-5xl font-extrabold leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${accent}`}
              >
                <CountUp value={value} />
                {suffix && <span>{suffix}</span>}
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
