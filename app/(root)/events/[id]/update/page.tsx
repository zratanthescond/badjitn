import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";
import { useUser } from "@/lib/actions/user.actions";
import { checkOrgPermission } from "@/lib/actions/organisation.actions";
import { notFound, redirect } from "next/navigation";

type UpdateEventProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateEvent = async (props: UpdateEventProps) => {
  const params = await props.params;

  const {
    id
  } = params;

  const user = await useUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const userId = user._id.toString();
  const event = await getEventById(id);

  if (!event) {
    return notFound();
  }

  // Check permission: user must be organizer OR admin/creator of the event's organisation
  const isOrganizer = event.organizer?._id === userId;
  let hasOrgAccess = false;

  if (event.organisation?._id) {
    const permission = await checkOrgPermission(event.organisation._id, userId);
    hasOrgAccess = permission.hasAccess;
  }

  if (!isOrganizer && !hasOrgAccess) {
    return redirect("/");
  }

  return (
    <>
      <section className="glass backdrop-blur backdrop-brightness-90 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event._id}
          userId={userId}
          organisationId={event.organisation?._id}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
