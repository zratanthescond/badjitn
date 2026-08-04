"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { buildInvitationEmailHtml } from "@/lib/invitationTemplate";
import {
  getInvitationSettings,
  saveInvitationSettings,
  sendTestInvitationEmail,
  type InvitationEmailSettings,
} from "@/lib/actions/invitation.actions";

interface InvitationTemplateEditorProps {
  eventId: string;
  eventImageUrl: string;
}

export default function InvitationTemplateEditor({
  eventId,
  eventImageUrl,
}: InvitationTemplateEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const [settings, setSettings] = useState<InvitationEmailSettings>({
    subject: "",
    headerImageUrl: eventImageUrl,
    bodyHtml: "",
    buttonLabel: "S'inscrire",
    footerText: "",
    footerPhone: "",
    footerEmail: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getInvitationSettings(eventId);
      if (res.success && res.data) {
        setSettings(res.data.settings);
        setRegistrationUrl(res.data.registrationUrl);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const previewHtml = useMemo(
    () =>
      buildInvitationEmailHtml({
        ...settings,
        buttonUrl: registrationUrl || "#",
      }),
    [settings, registrationUrl]
  );

  const update = (patch: Partial<InvitationEmailSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveInvitationSettings(eventId, settings);
      if (res.success) {
        toast({ title: "Enregistré", description: res.message });
      } else {
        toast({ title: "Erreur", description: res.message, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setSendingTest(true);
    try {
      const res = await sendTestInvitationEmail({ eventId, testEmail: testEmail.trim() });
      if (res.success) {
        toast({ title: "Email de test envoyé", description: res.message });
      } else {
        toast({ title: "Erreur", description: res.message, variant: "destructive" });
      }
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Sujet de l'email</Label>
          <Input
            value={settings.subject}
            onChange={(e) => update({ subject: e.target.value })}
            placeholder="Invitation à participer..."
            className="mt-1.5"
          />
        </div>

        <ImageUploader
          value={settings.headerImageUrl || ""}
          onChange={(url) => update({ headerImageUrl: url })}
          aspectRatio="wide"
          label="Image d'en-tête"
          placeholder="Glissez une image, ou cliquez pour la sélectionner"
        />

        <div>
          <Label className="text-xs text-muted-foreground">Contenu du message</Label>
          <MinimalTiptapEditor
            value={settings.bodyHtml}
            onChange={(html) => update({ bodyHtml: html as string })}
            className="mt-1.5 w-full"
            editorContentClassName="p-4"
            output="html"
            placeholder="Chère Consœur, Cher Confrère,..."
            editable={true}
            editorClassName="focus:outline-none min-h-[160px]"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Libellé du bouton</Label>
          <Input
            value={settings.buttonLabel}
            onChange={(e) => update({ buttonLabel: e.target.value })}
            placeholder="S'inscrire au Congrès"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
            → {registrationUrl}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Téléphone (footer)</Label>
            <Input
              value={settings.footerPhone}
              onChange={(e) => update({ footerPhone: e.target.value })}
              placeholder="00 000 000"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email (footer)</Label>
            <Input
              value={settings.footerEmail}
              onChange={(e) => update({ footerEmail: e.target.value })}
              placeholder="contact@exemple.com"
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Texte additionnel (footer)</Label>
          <Input
            value={settings.footerText}
            onChange={(e) => update({ footerText: e.target.value })}
            placeholder="Optionnel"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer le modèle
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
          <Input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="votre@email.com"
            className="max-w-xs mt-2"
          />
          <Button
            variant="outline"
            className="rounded-full mt-2"
            onClick={handleSendTest}
            disabled={sendingTest || !testEmail.trim()}
          >
            {sendingTest ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Envoyer un test
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Aperçu</Label>
        <div className="rounded-xl border border-border/50 overflow-hidden bg-slate-100 dark:bg-slate-900">
          <iframe
            title="Aperçu de l'email"
            srcDoc={`<html><body style="margin:0;padding:16px;background:#eaf3fb;">${previewHtml}</body></html>`}
            className="w-full"
            style={{ height: 640, border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
