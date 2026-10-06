import { redirect } from "next/navigation";
import WorkUploader from "@/components/shared/WorkUploader";
import { getEventById } from "@/lib/actions/event.actions";
import { useUser } from "@/lib/actions/user.actions";

type SubmitWorkPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ email?: string; workId?: string }>;
};

export default async function SubmitWorkPage(props: SubmitWorkPageProps) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const [event, user] = await Promise.all([getEventById(params.id), useUser()]);

  if (!event) {
    redirect("/");
  }

  return (
    <WorkUploader
      eventId={params.id}
      userId={user?._id ? String(user._id) : undefined}
      email={user?.email || searchParams?.email}
      submissionDeadline={event.workSubmissionDeadline}
      allowAbstractFileUpload={
        event.workAbstractConfig?.allowAbstractFileUpload !== false
      }
      posterFileTypes={event.workAbstractConfig?.posterFileTypes}
    />
  );
}
