"use client";

interface Partner { name: string; logo?: string; website?: string }

export default function OrgPartnersCarousel({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  // Repeat enough times so each "half" of the track exceeds any viewport width
  const targetPerHalf = Math.max(12, partners.length);
  const repeats = Math.ceil(targetPerHalf / partners.length);
  const base = Array.from({ length: repeats }, () => partners).flat();
  const items = [...base, ...base];

  return (
    <section className="w-full py-16 bg-white dark:bg-elite-charcoal overflow-hidden border-t border-slate-100 dark:border-white/[0.06]">
      {/* Section header */}
      <div className="text-center mb-10 px-4">
        <span
          className="text-[10px] font-syne font-bold uppercase tracking-[0.18em]"
          style={{
            background: "linear-gradient(to right, #624CF5, #20D5EC)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ils nous soutiennent
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-syne font-bold text-slate-900 dark:text-white">
          Nos Sponsors &amp; Partenaires
        </h2>
        <div className="mt-3 mx-auto w-10 h-px" style={{ background: "linear-gradient(to right, #624CF5, #20D5EC)" }} />
      </div>

      {/* Scrolling track */}
      <div className="relative overflow-hidden">
        {/* Light mode fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 dark:hidden"
          style={{ background: "linear-gradient(to right, white, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 dark:hidden"
          style={{ background: "linear-gradient(to left, white, transparent)" }}
        />
        {/* Dark mode fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 hidden dark:block"
          style={{ background: "linear-gradient(to right, #0A0A0C, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 hidden dark:block"
          style={{ background: "linear-gradient(to left, #0A0A0C, transparent)" }}
        />

        <div
          className="flex py-4"
          style={{ width: "max-content", animation: "partners-roll 40s linear infinite" }}
        >
          {items.map((p, i) => (
            <a
              key={i}
              href={p.website || "#"}
              target={p.website ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.07] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[150px] mx-2.5 ${!p.website ? "pointer-events-none" : ""}`}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(98,76,245,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(98,76,245,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "";
              }}
            >
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logo}
                  alt={p.name}
                  className="h-12 w-auto max-w-[110px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(98,76,245,0.08)", border: "1px solid rgba(98,76,245,0.15)" }}
                >
                  <span className="text-lg font-black font-syne" style={{ color: "#624CF5" }}>
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight font-outfit">
                {p.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes partners-roll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
