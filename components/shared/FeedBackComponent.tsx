import { MinimalTiptapEditor } from "../minimal-tiptap";
import { CommentSection } from "./comment/CommentSection";

const FeedBackComponenet = ({ eventId }: { eventId: string }) => {
  return (
    <div className="flex w-full h-full ">
      {/* <MinimalTiptapEditor
        // value={field.value}
        // onChange={(e) => field.onChange(e)}
        className="w-full max-w-[90vw] md:max-w-full flex min-h-max bg-card-foreground/5"
        editorContentClassName="p-1 h-52 "
        output="html"
        placeholder="Type your Feedback here..."
        autofocus={true}
        editable={true}
        editorClassName="focus:outline-none"
        immediatelyRender={true}
      /> */}
      <CommentSection postId={eventId} />
    </div>
  );
};

export default FeedBackComponenet;
