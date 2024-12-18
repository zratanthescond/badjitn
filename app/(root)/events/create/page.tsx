import EventForm from "@/components/shared/EventForm";
import { auth } from "@/app/auth";

const CreateEvent = async () => {
  const session = await auth();
  const user = session?.userData;
  console.log(user);
  const userId = user?.id as string;

  return (
    <>
      <div className="wrapper glass rounded-xl  p-4  my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
