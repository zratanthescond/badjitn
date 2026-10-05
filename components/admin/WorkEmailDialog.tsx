"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Mail, RotateCcw, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export type WorkEmailPayload = {
  subject: string;
  message: string;
  extraLine: string;
};

/**
 * Compose dialog for organizer emails about résumés. Prefilled with the
 * default status text; the organizer can edit the subject and message and
 * append an extra highlighted line. Used both for a single row and for the
 * bulk "all approved" send.
 */
export function WorkEmailDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultSubject,
  defaultMessage,
  recipientSummary,
  confirmLabel,
  isSending,
  onSend,
  onSendTest,
  isSendingTest = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultSubject: string;
  defaultMessage: string;
  /** e.g. "Destinataire : jane@x.com" or "12 résumés approuvés". */
  recipientSummary?: string;
  confirmLabel: string;
  isSending: boolean;
  onSend: (payload: WorkEmailPayload) => void | Promise<void>;
  /** When provided, shows a "send a test" row; `to` is empty when the organizer wants their own address. */
  onSendTest?: (payload: WorkEmailPayload, to: string) => void | Promise<void>;
  isSendingTest?: boolean;
}) {
  const t = useTranslations("workEmailDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [extraLine, setExtraLine] = useState("");
  const [testEmail, setTestEmail] = useState("");

  // Re-seed the fields each time the dialog opens so edits from a previous
  // send (or a different row) do not leak into the next one.
  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      setExtraLine("");
      setTestEmail("");
    }
  }, [open, defaultSubject, defaultMessage]);

  const busy = isSending || isSendingTest;
  const currentPayload = (): WorkEmailPayload => ({
    subject: subject.trim(),
    message: message.trim(),
    extraLine: extraLine.trim(),
  });

  const resetToDefaults = () => {
    setSubject(defaultSubject);
    setMessage(defaultMessage);
    setExtraLine("");
  };

  const fontClass = isRTL ? "font-arabic" : "";
  const hasContent = subject.trim().length > 0 && message.trim().length > 0;
  const canSend = !busy && hasContent;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className={`sm:max-w-xl ${isRTL ? "rtl text-right" : ""}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${fontClass}`}>
            <Mail className="h-5 w-5 text-blue-500" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className={fontClass}>{description}</DialogDescription>
          )}
        </DialogHeader>

        {recipientSummary && (
          <p
            className={`rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-sm text-blue-800 dark:text-blue-200 ${fontClass}`}
          >
            {recipientSummary}
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="work-email-subject" className={fontClass}>
              {t("subjectLabel")}
            </Label>
            <Input
              id="work-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              maxLength={200}
              disabled={isSending}
              className={fontClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="work-email-message" className={fontClass}>
              {t("messageLabel")}
            </Label>
            <Textarea
              id="work-email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={6}
              disabled={isSending}
              className={fontClass}
            />
            <p className={`text-xs text-muted-foreground ${fontClass}`}>
              {t("messageHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="work-email-extra" className={fontClass}>
              {t("extraLineLabel")}
            </Label>
            <Textarea
              id="work-email-extra"
              value={extraLine}
              onChange={(e) => setExtraLine(e.target.value)}
              placeholder={t("extraLinePlaceholder")}
              rows={2}
              maxLength={1000}
              disabled={isSending}
              className={fontClass}
            />
            <p className={`text-xs text-muted-foreground ${fontClass}`}>
              {t("extraLineHint")}
            </p>
          </div>

          {onSendTest && (
            <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
              <Label htmlFor="work-email-test" className={`flex items-center gap-2 ${fontClass}`}>
                <FlaskConical className="h-4 w-4 text-amber-600" />
                {t("testLabel")}
              </Label>
              <div className={`flex flex-col sm:flex-row gap-2 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <Input
                  id="work-email-test"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={t("testPlaceholder")}
                  disabled={busy}
                  className={`flex-1 ${fontClass}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSendTest(currentPayload(), testEmail.trim())}
                  disabled={busy || !hasContent}
                  className={`shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 ${fontClass}`}
                >
                  {isSendingTest ? (
                    <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mr-2" />
                  ) : (
                    <FlaskConical className="h-4 w-4 mr-2" />
                  )}
                  {t("testButton")}
                </Button>
              </div>
              <p className={`text-xs text-muted-foreground ${fontClass}`}>
                {t("testHint")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={resetToDefaults}
            disabled={busy}
            className={`sm:mr-auto ${fontClass}`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("reset")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className={fontClass}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => onSend(currentPayload())}
            disabled={!canSend}
            className={`bg-blue-600 hover:bg-blue-700 text-white ${fontClass}`}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
