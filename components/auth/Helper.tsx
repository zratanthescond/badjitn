"use client";
import { useSession } from "next-auth/react";
import { UserDropDown } from "../shared/UserDropDown";
export function SignedOut({ children }: { children: React.ReactNode }) {
  // alert("SignedOut");
  const { data: session } = useSession();
  console.log("********************************");
  console.log(session);
  console.log("********************************");
  if (!session) {
    return <>{children}</>;
  }
  return null;
}
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  if (!session) {
    return null;
  }
  return <>{children}</>;
}

export function UserButton({ afterSignOutUrl }: { afterSignOutUrl: string }) {
  const { data: session } = useSession();
  if (!session) {
    return null;
  }
  return <UserDropDown afterSignOutUrl={afterSignOutUrl} user={session} />;
}
