"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import { ModeToggle } from "../ModeToggle";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import LocaleSwitcher from "./LocaleSwitcher";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "next-intl";
const Header = () => {
  const dimensions = useMediaQuery("(min-width: 768px)");
  const t = useTranslations("Navbar");
  return (
    <header className="flex flex-1 w-full fixed border-b border-border/40 backdrop-blur-xl glass z-50">
      <div className="wrapper flex items-center justify-between">
        <div className="flex-row flex items-center ">
          <Link href="/" className=" d-flex flex-row ">
            <Image
              src="/assets/images/logo.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover hidden dark:block w-[100px] md:w-[128px] h-auto"
            />
            <Image
              src="/assets/images/logoDark.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover block dark:hidden w-[100px] md:w-[128px] h-auto"
            />
          </Link>
        </div>
        <SignedIn>
          <nav className="md:flex-between hidden w-full max-w-xs">
            <NavItems />
          </nav>
        </SignedIn>
        <div className="flex items-center justify-end gap-3 min-w-max">
          {dimensions && (
            <>
              <LocaleSwitcher />
              <ModeToggle />
            </>
          )}

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button
              asChild
              className="rounded-full"
              size="lg"
              variant={"outline"}
            >
              <Link href="/sign-in"> {t("login")}</Link>
            </Button>
          </SignedOut>
        </div>{" "}
      </div>
    </header>
  );
};

export default Header;
