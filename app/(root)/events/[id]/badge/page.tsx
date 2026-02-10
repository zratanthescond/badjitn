import { auth } from "@clerk/nextjs";
import { getEventById } from "@/lib/actions/event.actions";
import { IntegratedBadgeSystem } from "@/components/shared/badge/integrated-badge-system";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/actions/user.actions";

type BadgePageProps = {
    params: {
        id: string;
    };
};

export default async function BadgePage({ params: { id } }: BadgePageProps) {
    const user = await useUser();
    if (!user) {
        return redirect("/sign-in");
    }
    const userId = user?._id;
    const event = await getEventById(id);

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        );
    }

    // Security check: Only organizer or admin should see this
    const isOrganizer = event.organizer.clerkId === user.clerkId;

    // Note: Depending on the project, you might have a global admin check too.
    if (!isOrganizer) {
        redirect("/");
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/events/${id}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Event
                    </Link>
                </Button>
            </div>

            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Generate Event Badges</h1>
                <p className="text-muted-foreground">
                    Design custom badges and manage printing for your ticket holders.
                </p>
            </header>

            <IntegratedBadgeSystem
                eventId={id}
                eventTitle={event.title}
                eventStart={event.startDateTime}
                eventEnd={event.endDateTime}
            />
        </div>
    );
}
