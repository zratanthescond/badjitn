import { redirect } from "next/navigation";
import WorkUploader from "@/components/shared/WorkUploader";
import { getEventById } from "@/lib/actions/event.actions";
import { useUser } from "@/lib/actions/user.actions";

type SubmitWorkPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubmitWorkPage(props: SubmitWorkPageProps) {
  const params = await props.params;
  const [event, user] = await Promise.all([getEventById(params.id), useUser()]);

  if (!event) {
    redirect("/");
  }

  if (!user) {
    redirect("/sign-in");
  }

  return <WorkUploader eventId={params.id} userId={user._id} />;
}
