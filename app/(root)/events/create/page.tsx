import { useUser } from "@/lib/actions/user.actions";
import CreateEventPage from "@/components/create-event-page";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateEvent() {
  const user = await useUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <CreateEventPage user={user} />;
}
export const metadata = {
  title: "Create Event",
  description: "Create a new event on Badgi.net",
  robots: {
    index: false,
    follow: false,
  },
};
