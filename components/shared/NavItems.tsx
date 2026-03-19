"use client";

import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CalendarDays, CalendarPlus, User, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

const getAIToolConfig = async () => {
  const response = await fetch("/api/ai-tools/config", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AI tool config");
  }

  return response.json();
};

const NavItems = () => {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const { user } = useUser();

  const userEmails = React.useMemo(() => {
    return user?.emailAddresses?.map((ea) => ea.emailAddress.toLowerCase()) || [];
  }, [user]);

  const { data: config } = useQuery({
    queryKey: ["aiToolConfig"],
    queryFn: () => getAIToolConfig(),
    staleTime: 60_000,
  });

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

  const filteredLinks = headerLinks.filter((link) => {
    if (link.route === "/ai-tools") {
      const isGlobalEnabled = config?.isRouteEnabled !== false;
      const accessList = config?.userAccess || [];
      const hasAccess = userEmails.some((ue: string) =>
        accessList.some((entry: { email: string; tools?: any[] }) =>
          entry.email.toLowerCase() === ue && (entry.tools && entry.tools.length > 0)
        )
      );
      return isGlobalEnabled && hasAccess;
    }
    return true;
  });

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {filteredLinks.map((link) => {
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
