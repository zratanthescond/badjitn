import type { ReactNode } from "react";
import { Badge } from "../ui/badge";

interface DetailItem {
  label: string;
  value: string | number;
  align?: "left" | "right";
}

interface MobileCardProps {
  title: string;
  subtitle: string;
  badge: string;
  details: DetailItem[];
  footer: ReactNode;
}

export default function MobileCard({
  title,
  subtitle,
  badge,
  details,
  footer,
}: MobileCardProps) {
  return (
    <div className="border border-card-foreground rounded-xl p-4 bg-card space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs ">{subtitle}</p>
        </div>
        <Badge
          variant="secondary"
          className={`${
            badge === "pending"
              ? "bg-yellow-500"
              : badge === "approved"
              ? "bg-green-500"
              : "bg-red-500"
          } text-white`}
        >
          {badge}
        </Badge>
      </div>

      <div
        className={`flex justify-between text-sm ${
          details.length > 1 ? "flex-col items-start" : "flex-row items-center "
        }`}
      >
        {details.map((detail, index) => (
          <span
            key={index}
            className={detail.align === "right" ? "font-medium text-right" : ""}
          >
            {detail.label && `${detail.label}: `}
            {detail.value}
          </span>
        ))}
      </div>

      {footer}
    </div>
  );
}
