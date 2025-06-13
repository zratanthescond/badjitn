import PublisherCard from "@/components/PublisherCard";
import EventForm from "@/components/shared/EventForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/lib/actions/user.actions";
export const dynamic = "force-dynamic";

const CreateEvent = async () => {
  const user = await useUser();

  console.log("userId", user);
  return (
    <>
      {user && user.publisher && user.publisher === "pending" && (
        <div className="wrapper glass rounded-xl  p-4  my-8">
          <Card className="w-full bg-card/30">
            <CardHeader>
              <CardTitle>
                Your publisher request has not been approved yet.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                You need to be approved by the admin to create an event. We will
                review your request and respond to you via email.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
      {user && user.publisher && user.publisher === "approved" && (
        <div className="wrapper glass rounded-xl  p-4  my-8">
          <EventForm userId={user._id} type="Create" />
        </div>
      )}
      {user && user.publisher && user.publisher === "rejected" && (
        <div className="wrapper glass rounded-xl p-4 my-8">
          <Card className="w-full bg-card/30">
            <CardHeader>
              <CardTitle>Your publisher request has been rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Please contact support for further assistance or to address any
                issues.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
      {!user ||
        !user.publisher ||
        (user.publisher === "none" && (
          <div className="wrapper  rounded-xl  p-4  my-8">
            <PublisherCard userId={user._id} />
          </div>
        ))}
    </>
  );
};

export default CreateEvent;
