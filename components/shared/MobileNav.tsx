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
import Link from "next/link";

import { useTranslations } from "next-intl";

const MobileNav = () => {
  const t = useTranslations();
  
  return (
    <nav className="md:hidden  ">
      <Sheet>
        <SheetTrigger className="align-middle">
          <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </SheetTrigger>
        <SheetContent className="flex glass-panel border-l border-white/10 flex-col gap-8 py-10 md:hidden w-[300px]">
          <div className="flex flex-row justify-center">
            <Link href="/" className="flex items-center transition-all duration-300 active:scale-95">
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
          <Separator className="bg-white/10" />

          <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
             <NavItems />
          </div>

          <div className="mt-auto flex flex-row items-center justify-between p-4 glass-panel bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex flex-col gap-1 items-start">
               <span className="text-[10px] uppercase font-outfit tracking-widest text-muted-foreground font-bold">
                 {t("theme.appearance")}
               </span>
               <ModeToggle />
            </div>
            <div className="flex flex-col gap-1 items-end">
               <span className="text-[10px] uppercase font-outfit tracking-widest text-muted-foreground font-bold">
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
