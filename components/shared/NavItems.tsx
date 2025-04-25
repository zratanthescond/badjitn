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
              isActive && "text-secondary-foreground"
            } flex-center bg-none p-medium-16 whitespace-nowrap  outline-2 p-2 outline-offset-2 rounded-full  hover:text-muted-foreground focus-visible:outline focus-visible:outline-primary`}
          >
            <Link href={link.route} className="flex flex-row gap-2 ">
              {getIcon(link.route)} {t(link.label)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
