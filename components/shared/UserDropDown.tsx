"use client";
import { Avatar } from "@radix-ui/react-avatar";
import { signOut } from "../../app/auth";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { doLogout } from "@/app/actions";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
export function UserDropDown({
  afterSignOutUrl,
  user,
}: {
  afterSignOutUrl: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full  " size="icon">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={user?.userData?.photo || user?.userData?.image}
              className="rounded-full"
            />
            <AvatarFallback>
              {user?.userData?.username &&
                user?.userData?.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => doLogout()}>Logout</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
