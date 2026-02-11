"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CalendarDays, CalendarPlus, User } from "lucide-react";
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

    return null;
  };
  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <li
            key={link.route}
            className={`${
              isActive
                ? "text-primary dark:text-white bg-primary/10 dark:bg-white/10"
                : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            } flex items-center w-full md:w-auto p-medium-16 whitespace-nowrap transition-all duration-200 rounded-xl md:rounded-full px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}
          >
            <Link href={link.route} className="flex flex-row items-center gap-3 w-full">
              <span className={isActive ? "text-primary dark:text-blue-400" : "text-muted-foreground"}>
                {getIcon(link.route)}
              </span>
              <span className="font-medium">{t(link.label)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
