"use client";

interface OrgRollingBannerProps {
  title?: string;
  content?: string;
}

export default function OrgRollingBanner({ title, content }: OrgRollingBannerProps) {
  if (!content) return null;

  return (
    <div
      className="w-full flex items-stretch overflow-hidden shadow-md"
      style={{ background: "linear-gradient(to right, #624CF5, #4f8ef7, #20D5EC)" }}
    >
      {title && (
        <div className="shrink-0 flex items-center px-5 py-3 border-r border-white/20 gap-2"
          style={{ background: "rgba(0,0,0,0.2)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#20D5EC" }} />
          <span className="font-syne font-extrabold text-white text-xs uppercase tracking-widest whitespace-nowrap">
            {title}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-hidden py-3">
        <div
          className="whitespace-nowrap text-white/90 text-sm font-medium font-outfit"
          style={{ display: "inline-block", animation: "org-marquee 28s linear infinite" }}
        >
          <span>{content}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
          <span>{content}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      <style>{`
        @keyframes org-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
