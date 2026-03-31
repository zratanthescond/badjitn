import { redirect } from "next/navigation";

type PostPurchasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostPurchasePage(
  props: PostPurchasePageProps
) {
  const params = await props.params;
  redirect(`/events/${params.id}`);
}
