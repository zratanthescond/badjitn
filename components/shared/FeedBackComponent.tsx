import { CommentSection } from "./comment/CommentSection";
import { useTranslations } from "next-intl";

const FeedBackComponenet = ({ eventId }: { eventId: string }) => {
  const t = useTranslations("event");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-[20px] border border-[#E4E4EF] p-5 md:p-8 gap-4">
      <h2 className="text-xl font-bold text-[#15152B]">{tx("askQuestion", "Poser une question")}</h2>
      <CommentSection postId={eventId} />
    </div>
  );
};

export default FeedBackComponenet;
