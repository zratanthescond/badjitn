"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CalendarDays, CalendarPlus, User } from "lucide-react";

const NavItems = () => {
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
              isActive && "text-primary-500"
            } flex-center bg-none p-medium-16 whitespace-nowrap glass outline-2 p-2 outline-offset-2 rounded-full`}
          >
            <Link href={link.route}>{getIcon(link.route)}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItems;
