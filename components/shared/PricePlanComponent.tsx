"use client";

import { Plus, Trash2, ArrowLeft, Package, ListTodo, Pencil, X, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface PlanOption {
  name: string;
  price: number;
  places?: number;
  description?: string;
  requireEmail?: boolean;
  registrationRequestOnly?: boolean;
}

interface PricePlan {
  name: string;
  price: number;
  places?: number;
  note?: string;
  options?: PlanOption[];
  isPackage?: boolean;
}

interface PricePlanComponentProps {
  pricePlan: PricePlan[];
  setPricePlan: React.Dispatch<React.SetStateAction<PricePlan[]>>;
  setIsPricePlan: React.Dispatch<React.SetStateAction<boolean>>;
  currencyCode: string;
  globalNote: string;
  setGlobalNote: (note: string) => void;
}

export default function PricePlanComponent({
  pricePlan,
  setPricePlan,
  setIsPricePlan,
  currencyCode,
  globalNote,
  setGlobalNote,
}: PricePlanComponentProps) {
  const t = useTranslations("pricePlan");
  const priceLabel = t("form.labels.price").replace(/\s*\([^)]*\)\s*$/, "");

  // ── form state ──────────────────────────────────────────────────────────
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planPlaces, setPlanPlaces] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [planIsPackage, setPlanIsPackage] = useState(false);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [currentOptionPrice, setCurrentOptionPrice] = useState("");
  const [currentOptionPlaces, setCurrentOptionPlaces] = useState("");
  const [currentOptionDescription, setCurrentOptionDescription] = useState("");
  const [currentOptionRequireEmail, setCurrentOptionRequireEmail] = useState(false);
  const [currentOptionRequestOnly, setCurrentOptionRequestOnly] = useState(false);

  // ── edit mode ────────────────────────────────────────────────────────────
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const resetOptionForm = () => {
    setCurrentOption("");
    setCurrentOptionPrice("");
    setCurrentOptionPlaces("");
    setCurrentOptionDescription("");
    setCurrentOptionRequireEmail(false);
    setCurrentOptionRequestOnly(false);
    setEditingOptionIndex(null);
  };

  const resetForm = () => {
    setPlanDescription("");
    setPlanPrice("");
    setPlanPlaces("");
    setPlanNote("");
    setPlanIsPackage(false);
    setPlanOptions([]);
    resetOptionForm();
    setEditingIndex(null);
  };

  const startEdit = (index: number) => {
    const plan = pricePlan[index];
    setPlanDescription(plan.name);
    setPlanPrice(plan.price.toString());
    setPlanPlaces(plan.places?.toString() ?? "");
    setPlanNote(plan.note ?? "");
    setPlanIsPackage(plan.isPackage ?? false);
    setPlanOptions(plan.options ?? []);
    resetOptionForm();
    setEditingIndex(index);
    // scroll form into view
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const startEditOption = (index: number) => {
    const opt = planOptions[index];
    setCurrentOption(opt.name);
    setCurrentOptionPrice(opt.price ? opt.price.toString() : "");
    setCurrentOptionPlaces(opt.places?.toString() ?? "");
    setCurrentOptionDescription(opt.description ?? "");
    setCurrentOptionRequireEmail(!!opt.requireEmail);
    setCurrentOptionRequestOnly(!!opt.registrationRequestOnly);
    setEditingOptionIndex(index);
  };

  const handleAddOption = () => {
    if (!currentOption.trim()) return;
    const nextOption: PlanOption = {
      name: currentOption.trim(),
      price: parseFloat(currentOptionPrice) || 0,
      places: currentOptionPlaces ? parseInt(currentOptionPlaces) : undefined,
      description: currentOptionDescription.trim() || undefined,
      requireEmail: currentOptionRequireEmail || undefined,
      registrationRequestOnly: currentOptionRequestOnly || undefined,
    };
    if (editingOptionIndex !== null) {
      setPlanOptions((prev) => prev.map((o, i) => (i === editingOptionIndex ? nextOption : o)));
    } else {
      setPlanOptions((prev) => [...prev, nextOption]);
    }
    setCurrentOption("");
    setCurrentOptionPrice("");
    setCurrentOptionPlaces("");
    setCurrentOptionDescription("");
    setCurrentOptionRequireEmail(false);
    setCurrentOptionRequestOnly(false);
    setEditingOptionIndex(null);
  };

  const removeOption = (index: number) => {
    setPlanOptions(planOptions.filter((_, i) => i !== index));
    // If we were editing an option, reset the form to avoid a stale index.
    if (editingOptionIndex !== null) resetOptionForm();
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const plan: PricePlan = {
      name: planDescription.trim() || `${t("list.planNumber")} ${editingIndex !== null ? editingIndex + 1 : pricePlan.length + 1}`,
      price: parseFloat(planPrice) || 0,
      places: planPlaces ? parseInt(planPlaces) : undefined,
      note: planNote.trim() || undefined,
      isPackage: planIsPackage || undefined,
      options: planOptions.length > 0 ? planOptions : undefined,
    };

    if (editingIndex !== null) {
      setPricePlan((prev) => prev.map((p, i) => (i === editingIndex ? plan : p)));
    } else {
      setPricePlan((prev) => [...prev, plan]);
    }

    resetForm();
  };

  const removePlan = (index: number) => {
    setPricePlan((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) resetForm();
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("emptyState.title")}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{t("emptyState.description")}</p>
      <Button variant="outline" onClick={() => setIsPricePlan(false)} className="rounded-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("emptyState.action")}
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20 rounded-3xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("title")}
            </h2>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <Button variant="outline" onClick={() => setIsPricePlan(false)} className="shrink-0 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("buttons.simplePrice")}
          </Button>
        </div>
      </div>

      <Separator />

      <CardContent className="p-6 space-y-8">

        {/* ── Global note ─────────────────────────────────────────────── */}
        <div className="space-y-2 p-4 rounded-2xl border border-dashed border-amber-400/40 bg-amber-50/30 dark:bg-amber-900/10">
          <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <StickyNote className="w-4 h-4" />
            Note globale pour la section tarification
            <span className="text-muted-foreground font-normal text-xs">(optionnel — visible par les participants)</span>
          </Label>
          <Textarea
            placeholder="Ex: Les prix indiqués incluent l'accès à toutes les sessions. Hébergement non inclus."
            value={globalNote}
            onChange={(e) => setGlobalNote(e.target.value)}
            className="resize-none rounded-2xl min-h-[72px] text-sm"
            maxLength={400}
          />
          {globalNote && (
            <p className="text-xs text-muted-foreground text-right">{globalNote.length}/400</p>
          )}
        </div>

        {/* ── Plan form ───────────────────────────────────────────────── */}
        <div ref={formRef} className={`space-y-5 p-5 rounded-3xl border-2 transition-colors duration-200 ${editingIndex !== null ? "border-primary/30 bg-primary/[0.03]" : "border-transparent"}`}>
          {editingIndex !== null && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Modifier le Plan n°{editingIndex + 1}
              </p>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm} className="rounded-full h-8 px-3 text-muted-foreground">
                <X className="w-3.5 h-3.5 mr-1" />
                Annuler
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                {t("form.labels.planDescription")}
              </Label>
              <Input
                id="description"
                placeholder={t("form.placeholders.planDescription")}
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="mt-1 rounded-full"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                {priceLabel} ({currencyCode})
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder={t("form.placeholders.price")}
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className="mt-1 rounded-full"
              />
            </div>

            {/* Places */}
            <div>
              <Label htmlFor="places" className="text-sm font-medium">
                {t("form.labels.availablePlaces")}
              </Label>
              <Input
                id="places"
                type="number"
                min="0"
                placeholder={t("form.placeholders.places")}
                value={planPlaces}
                onChange={(e) => setPlanPlaces(e.target.value)}
                className="mt-1 rounded-full"
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <Label htmlFor="note" className="text-sm font-medium">
                {t("form.labels.note")}
              </Label>
              <Input
                id="note"
                placeholder={t("form.placeholders.note")}
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
                className="mt-1 rounded-full"
              />
            </div>

            {/* All-inclusive package toggle */}
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] cursor-pointer">
                <Checkbox
                  checked={planIsPackage}
                  onCheckedChange={(v) => setPlanIsPackage(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium">Tarif tout inclus (package)</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Quand ce plan est sélectionné, son prix remplace les frais d'inscription et tous les autres plans/ateliers (total fixe).
                  </span>
                </span>
              </label>
            </div>

            {/* Choices Section */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Choix du plan
                <span className="text-muted-foreground font-normal text-xs">(optionnel — sélection unique)</span>
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Libellé du choix</Label>
                  <Input
                    placeholder="Ex: Petit déjeuner, VIP, etc."
                    value={currentOption}
                    onChange={(e) => setCurrentOption(e.target.value)}
                    className="rounded-full"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOption(); } }}
                  />
                </div>
                <div className="w-full sm:w-28">
                  <Label className="text-xs text-muted-foreground mb-1 block">Supplément ({currencyCode})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentOptionPrice}
                    onChange={(e) => setCurrentOptionPrice(e.target.value)}
                    className="rounded-full"
                  />
                </div>
                <div className="w-full sm:w-24">
                  <Label className="text-xs text-muted-foreground mb-1 block">Places</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={currentOptionPlaces}
                    onChange={(e) => setCurrentOptionPlaces(e.target.value)}
                    className="rounded-full"
                  />
                </div>
                <div className="flex gap-2 self-end">
                  <Button type="button" variant="secondary" onClick={handleAddOption} className="rounded-full">
                    {editingOptionIndex !== null ? "Mettre à jour" : "Ajouter"}
                  </Button>
                  {editingOptionIndex !== null && (
                    <Button type="button" variant="ghost" onClick={resetOptionForm} className="rounded-full">
                      Annuler
                    </Button>
                  )}
                </div>
              </div>

              {/* Optional instructions/description for the choice (e.g. payment modality details) */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Instructions / description du choix
                  <span className="ml-1 font-normal">(optionnel — ex: modalité de paiement, email de confirmation, date limite)</span>
                </Label>
                <Textarea
                  placeholder="Ex: Le laboratoire doit envoyer un mail de confirmation à contact@labo.tn et procéder au paiement par chèque avant le 15/09/2026."
                  value={currentOptionDescription}
                  onChange={(e) => setCurrentOptionDescription(e.target.value)}
                  className="resize-none rounded-2xl min-h-[60px] text-sm"
                  maxLength={500}
                />
                <label className="mt-2 flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={currentOptionRequireEmail}
                    onCheckedChange={(v) => setCurrentOptionRequireEmail(v === true)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Demander une adresse email si ce choix est sélectionné
                  </span>
                </label>
                <label className="mt-1 flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={currentOptionRequestOnly}
                    onCheckedChange={(v) => setCurrentOptionRequestOnly(v === true)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Demande d'inscription uniquement (masque les boutons de paiement, un seul bouton « Envoyer la demande » — inscription en attente de validation)
                  </span>
                </label>
              </div>

              {planOptions.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 bg-muted/30 rounded-2xl border border-dashed">
                  {planOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-1 bg-background rounded-xl px-3 py-2 border transition-colors ${
                        editingOptionIndex === idx ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{opt.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {opt.price > 0 && (
                            <Badge variant="secondary" className="rounded-full text-xs">+{opt.price} {currencyCode}</Badge>
                          )}
                          {opt.places !== undefined && (
                            <Badge variant="outline" className="rounded-full text-xs">{opt.places} places</Badge>
                          )}
                          {opt.requireEmail && (
                            <Badge variant="outline" className="rounded-full text-xs border-blue-400/50 text-blue-600">email requis</Badge>
                          )}
                          {opt.registrationRequestOnly && (
                            <Badge variant="outline" className="rounded-full text-xs border-amber-400/50 text-amber-600">demande seule</Badge>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditOption(idx)}
                            className="h-6 w-6 p-0 rounded-full text-primary hover:bg-primary/10"
                            title="Modifier le choix"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(idx)}
                            className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            title="Supprimer le choix"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {opt.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" className="rounded-full" onClick={handleSavePlan}>
              {editingIndex !== null ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Mettre à jour le Plan
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("buttons.addPlan")}
                </>
              )}
            </Button>
            {editingIndex !== null && (
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-full">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* ── Plans List ─────────────────────────────────────────────── */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("list.title")} ({pricePlan.length})
          </h3>

          <ScrollArea className="h-[400px] rounded-3xl border bg-muted/20 p-4">
            {pricePlan.length > 0 ? (
              <div className="space-y-4">
                {pricePlan.map((plan, index) => (
                  <Card
                    key={index}
                    className={`bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all rounded-3xl ${editingIndex === index ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={editingIndex === index ? "default" : "secondary"} className="text-xs rounded-full">
                          {t("list.planNumber")}{index + 1}
                          {editingIndex === index && " — en cours de modification"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(index)}
                            className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePlan(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                            title={t("actions.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-3">
                      <p className="font-medium text-sm leading-relaxed">{plan.name}</p>
                      {plan.note && (
                        <p className="text-muted-foreground text-xs mt-2 italic">{plan.note}</p>
                      )}
                      {plan.options && plan.options.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1">
                          {plan.options.map((opt, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] py-0 rounded-full opacity-70">
                                  {opt.name}
                                </Badge>
                                {opt.price > 0 && (
                                  <Badge variant="secondary" className="text-[10px] py-0 rounded-full">
                                    +{opt.price} {currencyCode}
                                  </Badge>
                                )}
                                {opt.places !== undefined && (
                                  <span className="text-[10px] text-muted-foreground">{opt.places} places</span>
                                )}
                              </div>
                              {opt.description && (
                                <p className="text-[10px] text-muted-foreground/80 italic leading-snug">{opt.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 flex items-center gap-3">
                      <Badge variant="outline" className="font-semibold rounded-full">
                        {plan.price} {currencyCode}
                      </Badge>
                      {plan.isPackage && (
                        <Badge className="text-xs rounded-full bg-primary/15 text-primary border-primary/30">
                          Tout inclus
                        </Badge>
                      )}
                      {plan.places !== undefined && (
                        <Badge variant="secondary" className="text-xs rounded-full">
                          {plan.places} {t("list.places")}
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
            <ScrollBar />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
