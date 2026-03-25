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
    <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel border-b border-white/10 transition-all duration-500 ease-elite-spring px-3 md:px-6">
      <div className="flex h-14 md:h-18 items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105 active:scale-95">
            <Image
              src="/assets/images/logo.png"
              width={128}
              height={38}
              alt="badgiTn logo"
              className="object-cover hidden dark:block"
            />
            <Image
              src="/assets/images/logoDark.png"
              width={128}
              height={38}
              alt="badgiTn logo"
              className="object-cover block dark:hidden"
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
              <div className="flex items-center gap-2 border-r border-white/10 pr-2 md:pr-3 mr-1 md:mr-2">
                <LocaleSwitcher />
                <ModeToggle />
              </div>
            )}

            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonTrigger: "hover:scale-110 active:scale-95 transition-all duration-300",
                      userButtonPopoverCard:
                        "glass-panel text-slate-900 dark:text-slate-100 border border-white/10 shadow-elite-soft",
                      userButtonPopoverMain: "bg-transparent",
                      userButtonPopoverActions: "gap-1",
                      userButtonPopoverActionButton:
                        "text-slate-800 dark:text-slate-100 hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all",
                      userButtonPopoverActionButtonText:
                        "text-slate-800 dark:text-slate-100 font-outfit font-medium",
                      userButtonPopoverActionButtonIcon:
                        "text-slate-600 dark:text-slate-300",
                      userPreviewMainIdentifier:
                        "text-slate-900 dark:text-slate-100 font-syne font-bold",
                      userPreviewSecondaryIdentifier:
                        "text-slate-600 dark:text-slate-300 font-outfit",
                      userButtonPopoverFooter:
                        "border-t border-white/10",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center">
                <Button 
                  asChild 
                  variant="elite" 
                  className="rounded-xl h-[42px] md:h-[46px] px-5 md:px-8 text-sm md:text-base font-syne font-bold transition-transform hover:-translate-y-0.5 flex-shrink-0"
                >
                  <Link href="/sign-in">{t("login")}</Link>
                </Button>
              </div>
            </SignedOut>

            {/* Mobile Nav is guaranteed space outside of auth constraints */}
            <div className="flex md:hidden items-center ml-1">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
