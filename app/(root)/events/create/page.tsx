import { useUser } from "@/lib/actions/user.actions";
import CreateEventPage from "@/components/create-event-page";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateEvent() {
  const user = await useUser();

  if (!user) {
    notFound();
  }

  return <CreateEventPage user={user} />;
}
export const metadata = {
  title: "Create Event",
  description: "Create a new event",
};
