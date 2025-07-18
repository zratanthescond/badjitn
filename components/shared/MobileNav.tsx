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

const MobileNav = () => {
  return (
    <nav className="md:hidden  ">
      <Sheet>
        <SheetTrigger className="align-middle">
          <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </SheetTrigger>
        <SheetContent className="flex bg-card/30  flex-col gap-6 md:hidden">
          <div className="flex flex-row justify-center">
            <Image
              src="/assets/images/logo.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover hidden dark:block  "
            />
            <Image
              src="/assets/images/logoDark.png"
              width={128}
              height={38}
              alt="BadjiTn logo"
              className="object-cover  block dark:hidden"
            />
          </div>
          <Separator className="border border-gray-50" />

          <NavItems />
          <div className="flex flex-row items-center justify-between p-2">
            <ModeToggle />
            <LocaleSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
