// Server-safe horizontal bar list (no hooks), used for small breakdowns.
export default function BarList({
  title,
  rows,
  empty,
}: {
  title: string;
  empty: string;
  rows: { key: string; label: string; value: number; detail?: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{r.label}</span>
                <span className="stat-figure shrink-0 text-foreground">{r.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              {r.detail && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
