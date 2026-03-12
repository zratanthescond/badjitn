import QRScannerPage from "@/components/admin/QRScannerPage";
import { getEventById } from "@/lib/actions/event.actions";
import { SearchParamProps } from "@/types";
import { auth } from "@clerk/nextjs/server";

export default async function ScanPage(props: SearchParamProps) {
  const params = await props.params;

  const {
    id
  } = params;

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;

  const event = await getEventById(id);

  if (!event) {
    return (
      <div className="flex-center h-screen">
        <h1 className="h1-bold text-slate-800">Évènement non trouvé</h1>
      </div>
    );
  }

  // Check if user is the organizer (only organizer can scan for now)
  // Or check for admin role if applicable. 
  // For now, we'll allow the organizer.
  if (event.organizer._id !== userId) {
     // Optional: Restriction check
  }

  return (
    <QRScannerPage
      eventId={event._id}
      eventTitle={event.title}
      scanPoints={event.scanPoints && event.scanPoints.length > 0 ? event.scanPoints : ["Entrée principale"]}
      userId={userId}
    />
  );
}
