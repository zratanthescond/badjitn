import { useUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function CockpitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await useUser();
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
