"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Plus,
  X,
  Loader2,
  Send,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  getInvitationSettings,
  sendEventInvitations,
  type InvitationRecipient,
} from "@/lib/actions/invitation.actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_OPTIONS = [
  { value: "skip", label: "Ignorer" },
  { value: "email", label: "Email" },
  { value: "firstname", label: "Prénom" },
  { value: "lastname", label: "Nom" },
];

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function autoMapHeader(header: string): string {
  const h = normalizeHeader(header);
  if (["email", "e-mail", "mail", "courriel"].includes(h)) return "email";
  if (["prenom", "firstname", "first name"].includes(h)) return "firstname";
  if (["nom", "lastname", "last name"].includes(h)) return "lastname";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("prenom") || h.includes("first")) return "firstname";
  if (h.includes("nom")) return "lastname";
  return "skip";
}

export default function SendInvitationsPanel({ eventId }: { eventId: string }) {
  const [recipients, setRecipients] = useState<InvitationRecipient[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const res = await getInvitationSettings(eventId);
      if (res.success && res.data) {
        setInvitedEmails(res.data.invitedEmails || []);
      }
    })();
  }, [eventId]);

  type AddSummary = {
    added: number;
    duplicateInBatch: number;
    alreadyInvited: number;
    invalid: number;
  };

  const addRecipients = (newOnes: InvitationRecipient[]): AddSummary => {
    const seen = new Set(recipients.map((r) => r.email.toLowerCase()));
    const alreadyInvitedSet = new Set(invitedEmails.map((e) => e.toLowerCase()));
    const unique: InvitationRecipient[] = [];
    let duplicateInBatch = 0;
    let alreadyInvited = 0;
    let invalid = 0;

    for (const r of newOnes) {
      const email = (r.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        invalid++;
        continue;
      }
      if (seen.has(email)) {
        duplicateInBatch++;
        continue;
      }
      if (alreadyInvitedSet.has(email)) {
        alreadyInvited++;
        continue;
      }
      seen.add(email);
      unique.push({ ...r, email });
    }

    if (unique.length > 0) setRecipients((prev) => [...prev, ...unique]);
    return { added: unique.length, duplicateInBatch, alreadyInvited, invalid };
  };

  const summaryDescription = ({ added, duplicateInBatch, alreadyInvited, invalid }: AddSummary) => {
    const parts = [`${added} ajouté(s)`];
    if (alreadyInvited > 0) parts.push(`${alreadyInvited} déjà invité(s) ignoré(s)`);
    if (duplicateInBatch > 0) parts.push(`${duplicateInBatch} doublon(s) ignoré(s)`);
    if (invalid > 0) parts.push(`${invalid} invalide(s) ignoré(s)`);
    return parts.join(" · ");
  };

  const addManualEmails = () => {
    const emails = manualInput
      .split(/[,;\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    const summary = addRecipients(emails.map((email) => ({ email })));
    setManualInput("");
    toast({
      title: "Emails ajoutés",
      description: summaryDescription(summary),
    });
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r.email !== email));
  };

  const clearAll = () => setRecipients([]);

  const resetFileState = () => {
    setRawHeaders([]);
    setRawRows([]);
    setMapping([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const xlsxModule = await import("xlsx");
        const XLSX: any = (xlsxModule as any).default ?? xlsxModule;
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        if (jsonData.length < 1) {
          toast({ title: "Fichier vide", variant: "destructive" });
          return;
        }

        const headers = jsonData[0].map((h: any) => String(h || "").trim());
        const rows = jsonData
          .slice(1)
          .filter((row) => row.some((c) => String(c || "").trim() !== ""))
          .map((row) => row.map((c) => String(c ?? "")));

        setRawHeaders(headers);
        setRawRows(rows);
        setMapping(headers.map((h) => autoMapHeader(h)));
      } else if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        const rows = lines.map((line) => line.split(/[,;\t]/).map((c) => c.trim()));

        const firstRowLooksLikeHeader = rows[0]?.some((c) =>
          /email|mail|prenom|nom|name/i.test(c)
        );

        if (firstRowLooksLikeHeader) {
          const headers = rows[0];
          setRawHeaders(headers);
          setRawRows(rows.slice(1));
          setMapping(headers.map((h) => autoMapHeader(h)));
        } else {
          // No header: extract any valid email found on each line
          const emails = lines
            .flatMap((line) => line.split(/[,;\t]/))
            .map((c) => c.trim())
            .filter((c) => EMAIL_RE.test(c));
          const summary = addRecipients(emails.map((email) => ({ email })));
          toast({
            title: "Fichier importé",
            description: summaryDescription(summary),
          });
          resetFileState();
          return;
        }
      } else {
        toast({
          title: "Format non supporté",
          description: "Utilisez un fichier .csv, .txt ou .xlsx",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur de lecture du fichier", variant: "destructive" });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateMapping = (index: number, value: string) => {
    setMapping((prev) => prev.map((m, i) => (i === index ? value : m)));
  };

  const emailColIndex = mapping.findIndex((m) => m === "email");

  const confirmFileImport = () => {
    if (emailColIndex === -1) {
      toast({
        title: "Colonne email requise",
        description: "Associez une colonne au champ Email avant de continuer.",
        variant: "destructive",
      });
      return;
    }
    const firstNameIdx = mapping.findIndex((m) => m === "firstname");
    const lastNameIdx = mapping.findIndex((m) => m === "lastname");

    const parsed: InvitationRecipient[] = rawRows.map((row) => ({
      email: (row[emailColIndex] || "").trim(),
      firstName: firstNameIdx !== -1 ? row[firstNameIdx]?.trim() : undefined,
      lastName: lastNameIdx !== -1 ? row[lastNameIdx]?.trim() : undefined,
    }));

    const summary = addRecipients(parsed);
    resetFileState();
    toast({ title: "Import terminé", description: summaryDescription(summary) });
  };

  const handleSend = async () => {
    if (recipients.length === 0) return;
    setSending(true);
    try {
      const res = await sendEventInvitations({ eventId, recipients });
      if (res.success) {
        toast({ title: "Envoi terminé", description: res.message });
        setRecipients([]);
        const res2 = await getInvitationSettings(eventId);
        if (res2.success && res2.data) setInvitedEmails(res2.data.invitedEmails || []);
      } else {
        toast({ title: "Erreur", description: res.message, variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  };

  const isAlreadyInvited = (email: string) =>
    invitedEmails.includes(email.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">
            Ajouter des emails (séparés par virgule, point-virgule ou retour à la ligne)
          </Label>
          <Textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={"docteur1@exemple.com\ndocteur2@exemple.com"}
            className="mt-1.5 min-h-[100px] font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full mt-2"
            onClick={addManualEmails}
            disabled={!manualInput.trim()}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Ajouter à la liste
          </Button>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Importer un fichier (.csv, .txt, .xlsx)
          </Label>
          <div className="mt-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Choisir un fichier
            </Button>
          </div>

          {rawHeaders.length > 0 && (
            <div className="mt-3 space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-border/30">
              <p className="text-xs text-muted-foreground">
                {rawRows.length} ligne(s) — associez les colonnes :
              </p>
              {rawHeaders.map((header, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs truncate flex-1">{header || `Colonne ${idx + 1}`}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Select value={mapping[idx]} onValueChange={(v) => updateMapping(idx, v)}>
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" className="rounded-full" onClick={confirmFileImport}>
                  Ajouter à la liste
                </Button>
                <Button size="sm" variant="ghost" onClick={resetFileState}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {recipients.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Destinataires ({recipients.length})
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              Tout effacer
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border/30 divide-y divide-border/30">
            {recipients.map((r) => (
              <div
                key={r.email}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="truncate">{r.email}</span>
                  {(r.firstName || r.lastName) && (
                    <span className="text-xs text-muted-foreground truncate">
                      {r.firstName} {r.lastName}
                    </span>
                  )}
                  {isAlreadyInvited(r.email) && (
                    <Badge variant="secondary" className="text-[10px]">
                      déjà invité
                    </Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeRecipient(r.email)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {sending
              ? "Envoi en cours..."
              : `Envoyer ${recipients.length} invitation${recipients.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
