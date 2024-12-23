import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs";

const CreateEvent = async () => {
  const { userId } = auth();

  console.log("userId", userId);
  return (
    <>
      <div className="wrapper glass rounded-xl  p-4  my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
