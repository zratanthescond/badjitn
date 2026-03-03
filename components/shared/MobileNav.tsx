import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { Separator } from "../ui/separator";
import NavItems from "./NavItems";
import { ModeToggle } from "../ModeToggle";
import LocaleSwitcher from "./LocaleSwitcher";
import { Menu } from "lucide-react";

import { useTranslations } from "next-intl";

const MobileNav = () => {
  const t = useTranslations();
  
  return (
    <nav className="md:hidden  ">
      <Sheet>
        <SheetTrigger className="align-middle">
          <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </SheetTrigger>
        <SheetContent className="flex backdrop-blur-3xl glass flex-col gap-8 py-10 md:hidden">
          <div className="flex flex-row justify-center">
            <Image
              src="/assets/images/logo.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover hidden dark:block w-[140px] h-auto"
            />
            <Image
              src="/assets/images/logoDark.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover block dark:hidden w-[140px] h-auto"
            />
          </div>
          <Separator className="bg-gray-200 dark:bg-gray-800" />

          <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
             <NavItems />
          </div>

          <div className="mt-auto flex flex-row items-center justify-between p-4 glass rounded-2xl bg-white/5 dark:bg-black/5">
            <div className="flex flex-col gap-1 items-start">
               <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                 {t("theme.appearance")}
               </span>
               <ModeToggle />
            </div>
            <div className="flex flex-col gap-1 items-end">
               <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                 {t("LocaleSwitcher.label")}
               </span>
               <LocaleSwitcher />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
