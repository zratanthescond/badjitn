"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CalendarDays, CalendarPlus, User, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const NavItems = () => {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const getIcon = (link: string) => {
    if (link === "/") {
      return <CalendarDays strokeWidth={2.25} />;
    }
    if (link === "/events/create") {
      return <CalendarPlus strokeWidth={2.25} />;
    }
    if (link === "/profile") {
      return <User strokeWidth={2.25} />;
    }

    if (link === "/ai-tools") {
      return <Sparkles strokeWidth={2.25} />;
    }
    return null;
  };
  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <li
            key={link.route}
            className={`group flex items-center w-full md:w-auto transition-all duration-300 rounded-xl px-4 py-2.5 ${
              isActive
                ? "bg-primary/10 text-primary dark:bg-white/5 dark:text-white shadow-elite-soft"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5"
            }`}
          >
            <Link href={link.route} className="flex flex-row items-center gap-3 w-full font-outfit">
              <span className={`transition-all duration-300 group-hover:scale-110 ${isActive ? "text-primary dark:text-elite-cyan" : "text-inherit"}`}>
                {getIcon(link.route)}
              </span>
              <span className={`font-semibold tracking-wide ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                {t(link.label)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
