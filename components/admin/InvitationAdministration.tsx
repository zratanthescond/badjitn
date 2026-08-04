"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, CalendarDays, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAllEvents } from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import InvitationTemplateEditor from "./InvitationTemplateEditor";
import SendInvitationsPanel from "./SendInvitationsPanel";
import InvitationHistoryPanel from "./InvitationHistoryPanel";

type PickedEvent = {
  _id: string;
  title: string;
  imageUrl: string;
  startDateTime: string;
};

export default function InvitationAdministration() {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PickedEvent | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-invitations-events", search],
    queryFn: () =>
      getAllEvents({
        country: "",
        query: search,
        category: "",
        date: "",
        limit: 20,
        page: 1,
      }),
    enabled: !selectedEvent,
  });

  const events: PickedEvent[] = data?.data || [];

  if (selectedEvent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedEvent(null)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Changer d'événement
          </Button>
          <div className="min-w-0">
            <p className="font-semibold truncate">{selectedEvent.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(new Date(selectedEvent.startDateTime)).dateOnly}
            </p>
          </div>
        </div>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="rounded-full">
            <TabsTrigger value="template" className="rounded-full">
              Modèle d'email
            </TabsTrigger>
            <TabsTrigger value="send" className="rounded-full">
              Envoyer des invitations
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full">
              Historique
            </TabsTrigger>
          </TabsList>
          <TabsContent value="template" className="mt-4">
            <InvitationTemplateEditor
              eventId={selectedEvent._id}
              eventImageUrl={selectedEvent.imageUrl}
            />
          </TabsContent>
          <TabsContent value="send" className="mt-4">
            <SendInvitationsPanel eventId={selectedEvent._id} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <InvitationHistoryPanel eventId={selectedEvent._id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Invitations par email
        </h2>
        <p className="text-sm text-muted-foreground">
          Choisissez un événement pour configurer et envoyer des invitations à s'inscrire.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un événement..."
          className="pl-9 rounded-full"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun événement trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => (
            <button
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className="text-left flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {event.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDateTime(new Date(event.startDateTime)).dateOnly}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
