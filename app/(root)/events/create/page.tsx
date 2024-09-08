import EventForm from "@/components/shared/EventForm";
import { auth, currentUser } from "@clerk/nextjs";
import { use } from "react";

const CreateEvent = async () => {
  const { sessionClaims } = auth();
  const user = await currentUser();
  console.log(user);
  const userId = user?.publicMetadata.userId as string;

  return (
    <>
      <section className="glass backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
