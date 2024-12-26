import EventForm from "@/components/shared/EventForm";
import { useUser } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";

const CreateEvent = async () => {
  const user = await useUser();

  console.log("userId", user);
  return (
    <>
      <div className="wrapper glass rounded-xl  p-4  my-8">
        <EventForm userId={user._id} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
