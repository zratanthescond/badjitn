"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { updateTenantSettings } from "@/lib/actions/tenant.actions";

interface Initial {
  logo: string;
  primaryColor: string;
  contact: { name: string; email: string; phone: string };
}

export default function SettingsForm({
  tenantSlug,
  initial,
  canEdit,
}: {
  tenantSlug: string;
  initial: Initial;
  canEdit: boolean;
}) {
  const t = useTranslations("pro.settings");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(initial.logo);
  const [color, setColor] = useState(initial.primaryColor);
  const [contact, setContact] = useState(initial.contact);

  const colorValid = !color || /^#[0-9a-fA-F]{6}$/.test(color);

  const save = async () => {
    setSaving(true);
    try {
      await updateTenantSettings(tenantSlug, { logo, primaryColor: color, contact });
      toast({ title: t("saved") });
      startTransition(() => router.refresh());
    } catch (error: any) {
      toast({ title: t("error"), description: error?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("branding.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("branding.description")}</p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className={canEdit ? undefined : "pointer-events-none opacity-70"}>
            <ImageUploader
              value={logo}
              onChange={setLogo}
              aspectRatio="square"
              size="sm"
              label={t("branding.logo")}
              placeholder={t("branding.logoPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-color">{t("branding.color")}</Label>
            <div className="flex items-center gap-2">
              <input
                id="pro-color"
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#0059bb"}
                onChange={(e) => setColor(e.target.value)}
                disabled={!canEdit}
                className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1 disabled:cursor-not-allowed"
                aria-label={t("branding.color")}
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={!canEdit}
                placeholder="#0059bb"
                className="w-32"
                aria-invalid={!colorValid}
              />
              {color && canEdit && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setColor("")}>
                  {t("branding.reset")}
                </Button>
              )}
            </div>
            {!colorValid && <p className="text-xs text-destructive">{t("branding.colorInvalid")}</p>}
            <p className="text-xs text-muted-foreground">{t("branding.colorHint")}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("contact.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("contact.description")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              ["name", "text"],
              ["email", "email"],
              ["phone", "tel"],
            ] as const
          ).map(([key, type]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`pro-contact-${key}`}>{t(`contact.${key}`)}</Label>
              <Input
                id={`pro-contact-${key}`}
                type={type}
                value={contact[key]}
                disabled={!canEdit}
                onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </section>

      {canEdit ? (
        <Button className="rounded-full" onClick={save} disabled={saving || !colorValid}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">{t("ownerOnly")}</p>
      )}
    </div>
  );
}
