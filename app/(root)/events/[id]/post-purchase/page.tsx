import { redirect } from "next/navigation";
import { getEventById } from "@/lib/actions/event.actions";
import PostPurchaseWorkPrompt from "@/components/shared/PostPurchaseWorkPrompt";

type PostPurchasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostPurchasePage(
  props: PostPurchasePageProps
) {
  const params = await props.params;
  const event = await getEventById(params.id);

  if (!event) {
    redirect("/");
  }

  if (!event.showWorkSubmissionPopup) {
    redirect("/profile");
  }

  return (
    <PostPurchaseWorkPrompt eventId={params.id} eventTitle={event.title} />
  );
}
