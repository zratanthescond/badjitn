"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, History, CheckCircle2, XCircle, RefreshCw, RotateCcw, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  getInvitationSettings,
  retryFailedInvitations,
  type InvitationLogEntry,
} from "@/lib/actions/invitation.actions";

function formatSentAt(sentAt: string | null) {
  if (!sentAt) return "—";
  try {
    return new Date(sentAt).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return sentAt;
  }
}

export default function InvitationHistoryPanel({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<InvitationLogEntry[]>([]);
  const [queueLength, setQueueLength] = useState(0);
  const [search, setSearch] = useState("");
  const [retrying, setRetrying] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getInvitationSettings(eventId);
    if (res.success && res.data) {
      setLog(res.data.invitationLog || []);
      setQueueLength(res.data.queueLength || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const failedCount = useMemo(
    () => log.filter((entry) => entry.status === "failed").length,
    [log]
  );
  const sentCount = useMemo(
    () => log.filter((entry) => entry.status === "sent").length,
    [log]
  );

  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const res = await retryFailedInvitations({ eventId });
      if (res.success) {
        toast({ title: "Nouvel essai programmé", description: res.message });
        await load();
      } else {
        toast({ title: "Erreur", description: res.message, variant: "destructive" });
      }
    } finally {
      setRetrying(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return log;
    return log.filter((entry) =>
      [entry.email, entry.firstName, entry.lastName]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [log, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <History className="h-4 w-4" />
            Destinataires ({log.length}) — {sentCount} envoyé{sentCount > 1 ? "s" : ""},{" "}
            {failedCount} échoué{failedCount > 1 ? "s" : ""}
          </h3>
          {queueLength > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <Clock className="h-3 w-3" />
              {queueLength} en attente d'envoi
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={handleRetryFailed}
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Réessayer les échoués ({failedCount})
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un email ou un nom..."
              className="pl-8 rounded-full h-8 text-sm w-64"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : log.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Aucune invitation envoyée pour le moment.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Aucun résultat pour « {search} ».
        </p>
      ) : (
        <div className="rounded-xl border border-border/50 divide-y divide-border/30 max-h-[480px] overflow-y-auto">
          {filtered.map((entry, idx) => (
            <div
              key={`${entry.email}-${entry.sentAt}-${idx}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{entry.email}</span>
                  {(entry.firstName || entry.lastName) && (
                    <span className="text-xs text-muted-foreground truncate">
                      {entry.firstName} {entry.lastName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{formatSentAt(entry.sentAt)}</p>
                {entry.status === "failed" && entry.errorMessage && (
                  <p
                    className="text-xs text-red-500/80 truncate max-w-[420px]"
                    title={entry.errorMessage}
                  >
                    {entry.errorMessage}
                  </p>
                )}
              </div>
              {entry.status === "sent" ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Envoyé
                </Badge>
              ) : (
                <Badge
                  className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 gap-1 shrink-0"
                  title={entry.errorMessage}
                >
                  <XCircle className="h-3 w-3" />
                  Échoué
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
