"use client";

import CheckoutButton from "./CheckoutButton";
import type { IEvent } from "@/lib/database/models/event.model";
import type { IField } from "@/lib/database/models/field.model";
import { getEventFields } from "@/lib/actions/field.action";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Landmark,
  LogIn,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions/order.actions";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { BankTransferModal } from "./bank-transfer-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { CountryDropdown, type Country } from "../ui/country-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { countries } from "country-data-list";
import { countryGovernorates } from "@/constants/country-governorates";
import { formatPriceByCountry, getCurrencyCodeByCountry } from "@/lib/utils";
import { useSubmitWorkSummary, type ClientInfo } from "@/hooks/useUploadWork";

type RegistrationInfoItem = {
  label: string;
  field: string;
  type: string;
  value: string;
};

type WorkChoice = "yes" | "no";

const baseRegistrationFields = [
  {
    _id: "firstName",
    label: "First name",
    type: "text",
    placeholder: "John",
    required: true,
    options: [],
  },
  {
    _id: "lastName",
    label: "Last name",
    type: "text",
    placeholder: "Doe",
    required: true,
    options: [],
  },
  {
    _id: "email",
    label: "Email",
    type: "text",
    placeholder: "john@example.com",
    required: true,
    options: [],
  },
  {
    _id: "jobTitle",
    label: "Role / Specialty",
    type: "text",
    placeholder: "Specialty",
    required: true,
    options: [],
  },
  {
    _id: "republic",
    label: "Republic",
    type: "text",
    placeholder: "Select a republic",
    required: true,
    options: [],
  },
  {
    _id: "city",
    label: "City",
    type: "text",
    placeholder: "Select a city",
    required: true,
    options: [],
  },
  {
    _id: "village",
    label: "Village",
    type: "text",
    placeholder: "Village",
    required: true,
    options: [],
  },
] as const;

export default function EventPriceComponent({ event }: { event: IEvent }) {
  const [checkPlan, setCheckedPlan] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [customFields, setCustomFields] = useState<IField[]>([]);
  const [registrationValues, setRegistrationValues] = useState<Record<string, string>>({});
  const [registrationErrors, setRegistrationErrors] = useState<Record<string, string>>({});
  const [workChoice, setWorkChoice] = useState<WorkChoice>("no");
  const [workSummaryTitle, setWorkSummaryTitle] = useState("");
  const [workSummaryNote, setWorkSummaryNote] = useState("");
  const [workSummaryError, setWorkSummaryError] = useState("");
  const [workSummaryId, setWorkSummaryId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [mongoUserId, setMongoUserId] = useState("");
  const t = useTranslations("eventPrice");
  const profileT = useTranslations("profile");
  const text = (key: string, fallback: string, values?: Record<string, string | number>) =>
    t.has(key) ? t(key as any, values) : fallback;
  const profileText = (key: string, fallback: string) =>
    profileT.has(key) ? profileT(key as any) : fallback;
  const { userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const submitWorkSummary = useSubmitWorkSummary();
  const currencyCode = getCurrencyCodeByCountry(event.country, event.location);
  const allowedCountries = useMemo(
    () =>
      countries.all.filter(
        (country: Country) =>
          country.emoji &&
          country.status !== "deleted" &&
          country.alpha3 !== "ISR" &&
          country.ioc !== "PRK"
      ) as Country[],
    []
  );

  useEffect(() => {
    const loadFields = async () => {
      if (!event.requiredInfo?.length) {
        setCustomFields([]);
        return;
      }

      const response = await getEventFields(event.requiredInfo);
      if (response.success) {
        setCustomFields(response.data);
      }
    };

    void loadFields();
  }, [event.requiredInfo]);

  useEffect(() => {
    if (!userId) {
      setMongoUserId("");
      return;
    }

    const controller = new AbortController();

    fetch(`/api/users?clerkId=${encodeURIComponent(userId)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user) return;
        setMongoUserId(user._id || "");
      })
      .catch(() => {});

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (searchParams.get("registered") !== "1") return;

    setSuccessOpen(true);
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!successOpen || userId) return;

    const timeout = window.setTimeout(() => {
      router.push(`/sign-in?redirect_url=${encodeURIComponent("/profile")}`);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [router, successOpen, userId]);

  const registrationFields = useMemo(() => {
    const disabledFields = event.disabledBaseFields || [];
    const filteredBase = baseRegistrationFields.filter((field) => {
      // If republic is configured (not none), we hide it
      if (field._id === "republic" && event.selectedRepublic && event.selectedRepublic !== "none") return false;
      
      // If republic is disabled, city is also disabled by design as it depends on it
      if (field._id === "city" && disabledFields.includes("republic")) return false;
      
      return !disabledFields.includes(field._id);
    });

    const eventCustomFields = (event.customRegistrationFields || []).map((cf) => ({
      _id: cf.label,
      label: cf.label,
      type: "text",
      placeholder: cf.label,
      required: cf.isRequired,
      options: [],
    }));

    return [...filteredBase, ...customFields, ...eventCustomFields];
  }, [customFields, event.disabledBaseFields, event.customRegistrationFields, event.selectedRepublic]);
  const cityOptions = useMemo(() => {
    const selectedRepublic = registrationValues.republic;
    if (!selectedRepublic) return [];
    return (countryGovernorates[selectedRepublic] || [])
      .map((city) => city.replace(/_/g, " "))
      .filter((city, index, arr) => arr.indexOf(city) === index);
  }, [registrationValues.republic]);
  const getFieldLabel = (fieldId: string, fallback: string) => {
    switch (fieldId) {
      case "firstName":
        return profileText("settings.fields.firstName", "First name");
      case "lastName":
        return profileText("settings.fields.lastName", "Last name");
      case "jobTitle":
        return event.jobTitleLabel || profileText("settings.fields.jobTitle", fallback);
      case "republic":
        if (event.disabledBaseFields?.includes("maskRepublicLabel")) return "";
        return profileText("settings.fields.republic", fallback);
      case "city":
        return profileText("settings.fields.city", fallback);
      case "village":
        return profileText("settings.fields.village", fallback);
      default:
        return fallback;
    }
  };

  useEffect(() => {
    setRegistrationValues((prev) => {
      const next = { ...prev };
      registrationFields.forEach((field) => {
        const fieldId = String(field._id);
        if (typeof next[fieldId] !== "string") {
          next[fieldId] = "";
        }
      });

      // Handle pre-selected republic
      if (event.selectedRepublic && event.selectedRepublic !== "none") {
        next.republic = event.selectedRepublic;
      }

      return next;
    });
  }, [registrationFields, event.selectedRepublic]);

  const handleAddPlan = (num: string) => {
    setCheckedPlan([num]);
  };

  const handleSelectOption = (planId: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [planId]: option }));
    if (!checkPlan.includes(planId)) {
      handleAddPlan(planId);
    }
  };

  const handleRegistrationValueChange = (fieldId: string, value: string) => {
    setRegistrationValues((prev) => ({
      ...prev,
      [fieldId]: value,
      ...(fieldId === "republic" ? { city: "" } : {}),
    }));
    setRegistrationErrors((prev) => ({
      ...prev,
      [fieldId]: "",
      ...(fieldId === "republic" ? { city: "" } : {}),
    }));
  };

  const price =
    event.pricePlan && event.pricePlan.length > 0
      ? event.pricePlan.reduce((sum, item: any) => {
          return checkPlan?.includes(item._id!) ? sum + item.price : sum;
        }, 0)
      : Number(event.price) || 0;
  const allowGuestRegistration = event.allowGuestRegistration !== false;
  const shouldShowWorkSubmission = event.showWorkSubmissionPopup === true;
  const workSummaryClientInfo = {
    firstName: registrationValues.firstName || "",
    lastName: registrationValues.lastName || "",
    jobTitle: registrationValues.jobTitle || "",
    republic: registrationValues.republic || "",
    city: registrationValues.city || "",
    village: registrationValues.village || "",
  } satisfies ClientInfo;

  const isAvailable = () => new Date(event.endDateTime) > new Date();

  const builtRegistrationInfo = useMemo<RegistrationInfoItem[]>(() => {
    const items = registrationFields.map((field) => ({
      field: String(field._id),
      label: getFieldLabel(String(field._id), field.label),
      type: field.type,
      value: registrationValues[String(field._id)] || "",
    }));

    if (shouldShowWorkSubmission) {
      items.push({
        field: "wantsToSubmitWork",
        label: "Soumettre un travail",
        type: "radio",
        value: workChoice,
      });

      if (workChoice === "yes") {
        items.push(
          {
            field: "workSummaryTitle",
            label: "Titre du resume",
            type: "text",
            value: workSummaryTitle.trim(),
          },
          {
            field: "workSummaryNote",
            label: "Resume",
            type: "text",
            value: workSummaryNote.trim(),
          }
        );
      }
    }

    return items;
  }, [
    getFieldLabel,
    registrationFields,
    registrationValues,
    shouldShowWorkSubmission,
    workChoice,
    workSummaryNote,
    workSummaryTitle,
  ]);

  const discountInfo = useMemo(() => {
    if (!event.discount?.field || !event.discount?.discount) {
      return null;
    }

    const selectedField = registrationFields.find(
      (field) => String(field._id) === event.discount?.field
    );
    const fieldValue = registrationValues[event.discount.field] || "";
    const isApplied = fieldValue === event.discount.value;

    return {
      field: event.discount.field,
      label: selectedField?.label || "",
      type: "discount",
      value: isApplied ? event.discount.discount : 0,
      fieldValue,
    };
  }, [event.discount, registrationFields, registrationValues]);

  const calculatePriceAsNumber = (basePrice: number) => {
    let finalPrice = basePrice;
    if (discountInfo && Number(discountInfo.value) > 0) {
      finalPrice = basePrice - (basePrice * Number(discountInfo.value)) / 100;
    }
    return Number.parseFloat(String(finalPrice)).toFixed(2);
  };

  const isFreeEvent = event.isFree || Number(calculatePriceAsNumber(price)) === 0;

  const validateRegistration = () => {
    const nextErrors: Record<string, string> = {};

    registrationFields.forEach((field) => {
      const fieldId = String(field._id);
      if (field.required && !(registrationValues[fieldId] || "").trim()) {
        nextErrors[fieldId] = text("requiredField", "Ce champ est obligatoire.");
      }
    });

    const email = (registrationValues.email || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = text("invalidEmail", "Veuillez saisir une adresse email valide.");
    }

    setRegistrationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateWorkSubmission = () => {
    if (!shouldShowWorkSubmission || workChoice !== "yes") {
      setWorkSummaryError("");
      return true;
    }

    if (!workSummaryTitle.trim() && !workSummaryNote.trim()) {
      setWorkSummaryError(
        "Veuillez renseigner au moins un titre ou un resume pour la soumission."
      );
      return false;
    }

    setWorkSummaryError("");
    return true;
  };

  const validateOptions = () => {
    for (const planId of checkPlan) {
      const plan = event.pricePlan?.find(p => p._id === planId);
      if (plan?.options?.length && !selectedOptions[planId]) {
        return false;
      }
    }
    return true;
  };

  const validateAll = () => {
    const registrationIsValid = validateRegistration();
    const workIsValid = validateWorkSubmission();
    const optionsAreValid = validateOptions();
    
    if (!optionsAreValid) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un choix pour le plan sélectionné.",
        variant: "destructive",
      });
      return false;
    }

    return registrationIsValid && workIsValid;
  };

  const persistWorkSummaryIfNeeded = async () => {
    if (!shouldShowWorkSubmission || workChoice !== "yes" || !userId) {
      return true;
    }

    if (!mongoUserId) {
      toast({
        title: t("error"),
        description:
          "Votre compte est en cours de chargement. Veuillez reessayer dans un instant.",
        variant: "destructive",
      });
      return false;
    }

    await submitWorkSummary.mutateAsync({
      ...(workSummaryId ? { workId: workSummaryId } : {}),
      eventId: event._id,
      userId: mongoUserId,
      title: workSummaryTitle.trim() || "Sans titre",
      clientInfo: workSummaryClientInfo,
      note: workSummaryNote.trim(),
    }).then((response) => {
      if (response?.work?._id) {
        setWorkSummaryId(response.work._id);
      }
    });

    return true;
  };

  const openRegistrationSuccess = () => {
    router.push(`${pathname}?registered=1`);
  };

  const handleGetPreorder = async () => {
    if (!validateAll()) {
      return;
    }

    try {
      setIsProcessing(true);
      const workReady = await persistWorkSummaryIfNeeded();
      if (!workReady) return;
      
      const details =
        event.pricePlan
          ?.filter((item) => checkPlan.includes(item._id!))
          .map((item) => ({
            name: item.name,
            price: item.price.toString(),
            option: selectedOptions[item._id!]
          })) || [];

      const order = await createOrder({
        eventId: event._id,
        totalAmount: calculatePriceAsNumber(price),
        type: "doorpay",
        requiredUserInfo: builtRegistrationInfo,
        ...(discountInfo && Number(discountInfo.value) > 0 ? { discountInfo } : {}),
        details,
        buyerId: userId || "",
        stripeId: `${uuidv4()}`,
        createdAt: new Date(),
      });

      if (order) {
        toast({
          title: t("success"),
          description: t("orderCreatedSuccess"),
        });
        openRegistrationSuccess();
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("orderCreatedError"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-full">
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-3xl border border-border/60 bg-background/95 p-0 sm:max-w-lg">
          <div className="rounded-t-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-white">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <CheckCircle className="h-6 w-6" />
                Inscription reussie
              </DialogTitle>
              <DialogDescription className="text-white/90">
                {userId
                  ? "Votre inscription a bien ete enregistree."
                  : "Votre inscription a bien ete enregistree. Un compte Badgi vous permettra de la retrouver plus facilement."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-6">
            <p className="text-sm leading-6 text-muted-foreground">
              {userId
                ? "Vous pouvez consulter votre inscription dans votre page profil Badgi."
                : "Merci de vous connecter a Badgi pour pouvoir consulter vos inscriptions. Vous allez etre redirige vers la page de connexion."}
            </p>

            {shouldShowWorkSubmission && workChoice === "yes" && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
                <p className="font-semibold">Soumission de travail</p>
                <p className="mt-1 text-muted-foreground">
                  {userId
                    ? "Votre resume a ete enregistre avec l'inscription."
                    : "Votre choix de soumettre un travail a ete note avec l'inscription."}
                </p>
              </div>
            )}

            <DialogFooter className="gap-3 sm:justify-end">
              {event.showReturnButton !== false && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setSuccessOpen(false)}
                >
                  {t("backToEvent")}
                </Button>
              )}
              {event.showProfileButton !== false && (
                <>
                  {userId ? (
                    <Button
                      type="button"
                      className="rounded-2xl"
                      onClick={() => {
                        setSuccessOpen(false);
                        router.push("/profile");
                      }}
                    >
                      Consulter mon profil
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="rounded-2xl"
                      onClick={() =>
                        router.push(`/sign-in?redirect_url=${encodeURIComponent("/profile")}`)
                      }
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter a Badgi
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-xl" />
      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/10 blur-xl" />

      <Card className="relative w-full overflow-hidden rounded-2xl border bg-card/90 shadow-2xl backdrop-blur-sm">
        <div className="absolute left-0 top-0 h-2 w-full rounded-t-[2rem] bg-gradient-to-r from-blue-500 via-pink-500 to-red-500" />

        <CardHeader className="items-center px-6 pb-2 pt-6">
          <div className="mb-2 flex items-center gap-2 rounded-full shadow-md">
            <span className="inline-flex items-center justify-center rounded-full bg-card/10 px-3 py-1 text-xs font-semibold text-foreground/80">
              <Ticket size={12} className="mr-1" />
              {event.title}
            </span>
          </div>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            {text("inscription", "Inscription")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-6">
          <div className="space-y-4">
            {!isFreeEvent && (
              <div className="rounded-[2rem] border border-border/50 bg-card/5 p-6 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-foreground">{t("eventTotalPrice")}</p>
                <div className="mt-2 text-center">
                  {discountInfo && Number(discountInfo.value) > 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-destructive line-through opacity-80">
                        {formatPriceByCountry(price, event.country, "en-US", event.location)}
                      </span>
                      <span className="text-4xl font-black text-primary">
                        {formatPriceByCountry(
                          calculatePriceAsNumber(price),
                          event.country,
                          "en-US",
                          event.location
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-black text-foreground">
                      {formatPriceByCountry(price, event.country, "en-US", event.location)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {event.pricePlan && event.pricePlan.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("selectPlans")}
                </p>
                <div className="grid gap-3">
                  {event.pricePlan.map((plan: any) => {
                    const isSelected = checkPlan.includes(plan._id);
                    return (
                      <div key={plan._id} className="flex flex-col gap-2">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAddPlan(plan._id)}
                          className={`relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border/50 bg-card/5 hover:border-primary/30 hover:bg-primary/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                              }`}
                            >
                              {isSelected && <CheckCircle size={14} className="text-primary-foreground" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{plan.name}</span>
                              {plan.places !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {plan.places} {t("availablePlaces")}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={isSelected ? "default" : "secondary"}
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              isSelected ? "bg-primary text-primary-foreground" : ""
                            }`}
                          >
                            {formatPriceByCountry(plan.price, event.country, "en-US", event.location)}
                          </Badge>
                        </motion.div>
                        
                        {plan.note && (
                          <div className="px-2 pb-1">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-xs text-blue-600 shadow-sm dark:text-blue-400">
                              <p className="font-medium">
                                {t("note")}: {plan.note}
                              </p>
                            </div>
                          </div>
                        )}

                        {plan.options && plan.options.length > 0 && (
                          <div className="mx-2 my-1 p-3 bg-muted/40 rounded-2xl border border-dashed border-primary/20 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                              Choisissez un choix :
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {plan.options.map((opt: string, idx: number) => {
                                const isOptSelected = selectedOptions[plan._id] === opt;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectOption(plan._id, opt)}
                                    className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border transition-all text-xs ${
                                      isOptSelected
                                        ? "border-primary bg-primary/10 text-primary font-medium"
                                        : "border-border/60 bg-background/50 hover:border-primary/40"
                                    }`}
                                  >
                                    <div className={`w-3 h-3 rounded-full border-2 ${isOptSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-3xl border border-border/60 bg-background/40 p-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {text("personalInformation", "Informations personnelles")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {text(
                    "personalInformationDescription",
                    "Remplissez les informations du participant avant de confirmer l'inscription."
                  )}
                </p>
              </div>

              {!allowGuestRegistration && !userId && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  {text("signInRequired", "Cet evenement exige un compte avant l'inscription.")}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {registrationFields.map((field) => (
                  <div
                    key={String(field._id)}
                    className={field.type === "radio" ? "space-y-3 md:col-span-2" : "space-y-2"}
                  >
                    <Label className="text-sm font-medium text-foreground">
                      {getFieldLabel(String(field._id), field.label)}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>

                    {String(field._id) === "republic" ? (
                      <>
                        <CountryDropdown
                          options={allowedCountries}
                          defaultValue={registrationValues.republic}
                          placeholder={
                            field.placeholder ||
                            profileText("settings.countryPlaceholder", "Select a republic")
                          }
                          onChange={(country) =>
                            handleRegistrationValueChange("republic", country.alpha3)
                          }
                          className="h-10 rounded-2xl"
                        />
                      </>
                    ) : String(field._id) === "city" ? (
                      <Select
                        value={registrationValues.city || ""}
                        onValueChange={(value) => handleRegistrationValueChange("city", value)}
                        disabled={!registrationValues.republic || cityOptions.length === 0}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue
                            placeholder={
                              cityOptions.length === 0
                                ? profileText("settings.cityNoOptions", "No cities available for this country")
                                : field.placeholder || profileText("settings.cityPlaceholder", "Select a city")
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cityOptions.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "select" ? (
                      <Select
                        value={registrationValues[String(field._id)] || ""}
                        onValueChange={(value) => handleRegistrationValueChange(String(field._id), value)}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder={field.placeholder || text("selectOption", "Selectionnez une option")} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "radio" ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {field.options?.map((option) => {
                          const isSelected = registrationValues[String(field._id)] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleRegistrationValueChange(String(field._id), option)}
                              className={`rounded-2xl border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/60 bg-card/40 hover:border-primary/40"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        type={String(field._id) === "email" ? "email" : field.type === "number" ? "number" : "text"}
                        value={registrationValues[String(field._id)] || ""}
                        onChange={(e) => handleRegistrationValueChange(String(field._id), e.target.value)}
                        placeholder={field.placeholder || getFieldLabel(String(field._id), field.label)}
                        className="rounded-2xl"
                      />
                    )}

                    {registrationErrors[String(field._id)] && (
                      <p className="text-sm text-destructive">{registrationErrors[String(field._id)]}</p>
                    )}
                  </div>
                ))}
              </div>

              {shouldShowWorkSubmission && (
                <div className="space-y-4 rounded-3xl border border-border/60 bg-card/30 p-5">
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-foreground">
                      Soumission de travail
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Indiquez si vous souhaitez soumettre un travail avec votre inscription.
                    </p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      { value: "no", label: "Non, sans soumission" },
                      { value: "yes", label: "Oui, soumettre un travail" },
                    ].map((option) => {
                      const isSelected = workChoice === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setWorkChoice(option.value as WorkChoice);
                            setWorkSummaryError("");
                          }}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 bg-card/40 hover:border-primary/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {workChoice === "yes" && (
                    <div className="space-y-4 rounded-3xl border border-primary/20 bg-primary/5 p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary/10 p-2">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-semibold text-foreground">Resume de soumission</h5>
                          <p className="text-sm text-muted-foreground">
                            Renseignez ici le resume a associer a votre inscription.
                          </p>
                        </div>
                      </div>

                      {!userId && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                          Votre choix sera enregistre avec l'inscription. Connectez-vous ensuite a
                          Badgi pour retrouver et completer votre soumission.
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Titre du resume
                        </Label>
                        <Input
                          value={workSummaryTitle}
                          onChange={(e) => {
                            setWorkSummaryTitle(e.target.value);
                            setWorkSummaryError("");
                          }}
                          placeholder="Titre de votre resume"
                          className="rounded-2xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Resume</Label>
                        <Textarea
                          value={workSummaryNote}
                          onChange={(e) => {
                            setWorkSummaryNote(e.target.value);
                            setWorkSummaryError("");
                          }}
                          placeholder="Ajoutez ici le resume de votre travail"
                          className="min-h-[180px] rounded-2xl"
                        />
                      </div>

                      {workSummaryError && (
                        <p className="text-sm text-destructive">{workSummaryError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {discountInfo && Number(discountInfo.value) > 0 && (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                  {text("discountApplied", `Reduction appliquee : ${discountInfo.value}% OFF`, {
                    value: Number(discountInfo.value),
                  })}
                </div>
              )}
            </div>

            {isAvailable() && (
              <>
                <CheckoutButton
                  event={event}
                  checkPlan={checkPlan}
                  selectedOptions={selectedOptions}
                  discountInfo={discountInfo}
                  requiredUserInfo={builtRegistrationInfo}
                  validateBeforeCheckout={validateAll}
                  beforeCheckout={persistWorkSummaryIfNeeded}
                />

                {!isFreeEvent && (
                  <>
                    {(!userId && !allowGuestRegistration) ? (
                      <Button
                        onClick={() => router.push("/sign-in")}
                        variant="outline"
                        className="h-14 w-full rounded-full bg-gradient-to-r from-slate-800 to-slate-900 font-semibold text-white shadow-lg transition-all duration-300 hover:from-slate-700 hover:to-slate-800"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="rounded-full bg-white/10 p-1.5">
                            <ShoppingBag size={16} className="text-white" />
                          </div>
                          <span>
                            {t("payInDoor")} {formatPriceByCountry(calculatePriceAsNumber(price), event.country, "en-US", event.location)}
                          </span>
                        </div>
                      </Button>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          onClick={() => void handleGetPreorder()}
                          disabled={isProcessing || price === 0}
                          variant="outline"
                          className="h-14 w-full rounded-full bg-gradient-to-r from-slate-800 to-slate-900 font-semibold text-white shadow-lg transition-all duration-300 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          <div className="flex items-center justify-center gap-3">
                            {isProcessing ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <div className="rounded-full bg-white/10 p-1.5">
                                  <ShoppingBag size={16} className="text-white" />
                                </div>
                                <span>
                                  {t("payInDoor")} {formatPriceByCountry(calculatePriceAsNumber(price), event.country, "en-US", event.location)}
                                </span>
                                <ArrowRight
                                  size={16}
                                  className={`transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                                />
                              </>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {!isFreeEvent &&
                  ((!userId && !allowGuestRegistration) ? (
                    <Button
                      onClick={() => router.push("/sign-in")}
                      disabled={price === 0}
                      className="h-14 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 font-semibold text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:from-pink-600 hover:to-rose-600"
                    >
                      <Landmark className="mr-2 h-5 w-5" />
                      Virement Bancaire {formatPriceByCountry(calculatePriceAsNumber(price), event.country, "en-US", event.location)}
                    </Button>
                  ) : (
                    <BankTransferModal
                      eventId={event._id}
                      buyerId={userId || ""}
                      amount={Number(calculatePriceAsNumber(price))}
                      currency={currencyCode}
                      details={
                        event.pricePlan
                          ?.filter((item) => checkPlan.includes(item._id!))
                          .map((item) => ({
                            name: item.name,
                            price: item.price.toString(),
                            option: selectedOptions[item._id!]
                          })) || []
                      }
                      requiredUserInfo={builtRegistrationInfo}
                      discountInfo={discountInfo}
                      validateBeforeOpen={validateAll}
                      beforeSubmit={persistWorkSummaryIfNeeded}
                    />
                  ))}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pb-2 pt-2 text-sm">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2">
              <CheckCircle size={14} className="text-green-500" />
              <span className="font-bold text-foreground">
                {isFreeEvent ? text("freeRegistration", "Inscription gratuite") : t("secureCheckout")}
              </span>
            </div>
            {!isFreeEvent && (
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="font-bold text-foreground">{t("instantConfirmation")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
