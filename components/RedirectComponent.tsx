import { useUser } from "@/lib/actions/user.actions";
import { headers } from "next/headers";

import { redirect, usePathname } from "next/navigation";

export default async function RedirectComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await useUser();
  const heads = headers();

  const pathname = heads.get("referer");
  const location = pathname?.split("/").pop();
  console.log(pathname);
  console.log(location);
  if (user && user.isBanned == true && location !== "banned")
    return redirect("/banned");
  return <>{children}</>;
}
