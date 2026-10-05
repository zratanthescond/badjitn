"use client";

import { useEffect, useState } from "react";
import { Mail, RotateCcw, Send } from "lucide-react";
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
}) {
  const t = useTranslations("workEmailDialog");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [extraLine, setExtraLine] = useState("");

  // Re-seed the fields each time the dialog opens so edits from a previous
  // send (or a different row) do not leak into the next one.
  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      setExtraLine("");
    }
  }, [open, defaultSubject, defaultMessage]);

  const resetToDefaults = () => {
    setSubject(defaultSubject);
    setMessage(defaultMessage);
    setExtraLine("");
  };

  const fontClass = isRTL ? "font-arabic" : "";
  const canSend = !isSending && subject.trim().length > 0 && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !isSending && onOpenChange(next)}>
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={resetToDefaults}
            disabled={isSending}
            className={`sm:mr-auto ${fontClass}`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("reset")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className={fontClass}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() =>
              onSend({
                subject: subject.trim(),
                message: message.trim(),
                extraLine: extraLine.trim(),
              })
            }
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
