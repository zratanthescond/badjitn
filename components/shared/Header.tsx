"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import { ModeToggle } from "../ModeToggle";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "./AuthWrappers";
import LocaleSwitcher from "./LocaleSwitcher";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
const Header = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const dimensions = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("Navbar");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="wrapper flex h-16 md:h-20 items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            <Image
              src="/assets/images/logo.png"
              width={140}
              height={42}
              alt="BadjiTn logo"
              className="hidden dark:block w-[110px] md:w-[140px] h-auto object-contain"
            />
            <Image
              src="/assets/images/logoDark.png"
              width={140}
              height={42}
              alt="BadjiTn logo"
              className="block dark:hidden w-[110px] md:w-[140px] h-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
          <SignedIn>
            <nav className="hidden md:flex items-center mr-4">
              <NavItems />
            </nav>
          </SignedIn>

          <div className="flex items-center gap-2 md:gap-3">
            {hasMounted && dimensions && (
              <div className="flex items-center gap-2 border-r border-border/50 pr-2 md:pr-3 mr-1 md:mr-2">
                <LocaleSwitcher />
                <ModeToggle />
              </div>
            )}

            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonPopoverCard:
                        "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xl",
                      userButtonPopoverMain: "bg-transparent",
                      userButtonPopoverActions: "gap-1",
                      userButtonPopoverActionButton:
                        "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors",
                      userButtonPopoverActionButtonText:
                        "text-slate-800 dark:text-slate-100 font-medium",
                      userButtonPopoverActionButtonIcon:
                        "text-slate-600 dark:text-slate-300",
                      userPreviewMainIdentifier:
                        "text-slate-900 dark:text-slate-100 font-semibold",
                      userPreviewSecondaryIdentifier:
                        "text-slate-600 dark:text-slate-300",
                      userButtonPopoverFooter:
                        "border-t border-slate-200 dark:border-slate-700",
                    },
                  }}
                />
                <MobileNav />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  className="rounded-full px-6 transition-all hover:shadow-lg active:scale-95"
                  size="default"
                  variant="outline"
                >
                  <Link href="/sign-in">{t("login")}</Link>
                </Button>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
