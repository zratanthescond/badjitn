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
  Sparkles,
  Ticket,
  Upload,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createOrder, checkExistingRegistration } from "@/lib/actions/order.actions";
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
import { calcFinalPrice, formatPriceByCountry, getCurrencyCodeByCountry } from "@/lib/utils";
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
  // Email captured for options flagged requireEmail (keyed by plan id)
  const [optionEmails, setOptionEmails] = useState<Record<string, string>>({});
  const [optionEmailErrors, setOptionEmailErrors] = useState<Record<string, string>>({});
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
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
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

  const [discountProofUrl, setDiscountProofUrl] = useState<string>("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  useEffect(() => {
    const loadFields = async () => {
      const ids = [...(event.requiredInfo || [])];
      // Always load the discount-trigger field so the user can fill it in
      if (event.discount?.field && !ids.includes(event.discount.field)) {
        ids.push(event.discount.field);
      }
      if (!ids.length) {
        setCustomFields([]);
        return;
      }
      const response = await getEventFields(ids);
      if (response.success) {
        const discountFieldId = event.discount?.field;
        const data = response.data.map((f: any) => {
          // Discount trigger field is always optional — participant may or may not qualify
          if (discountFieldId && String(f._id) === discountFieldId) {
            return { ...f, required: false };
          }
          return f;
        });
        setCustomFields(data);
      }
    };
    void loadFields();
  }, [event.requiredInfo, event.discount?.field]);

  const handleProofUpload = async (file: File) => {
    setIsUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setDiscountProofUrl(data.url);
        setRegistrationValues((prev) => ({ ...prev, discountProof: data.url }));
      }
    } catch {
      // upload failed silently
    } finally {
      setIsUploadingProof(false);
    }
  };

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
    setCheckedPlan((prev) => (prev.includes(num) ? prev : [...prev, num]));
  };

  const handleRemovePlan = (num: string) => {
    setCheckedPlan((prev) => prev.filter((id) => id !== num));
    setSelectedOptions((opts) => {
      const next = { ...opts };
      delete next[num];
      return next;
    });
    setOptionEmails((prev) => {
      const next = { ...prev };
      delete next[num];
      return next;
    });
    setOptionEmailErrors((prev) => {
      const next = { ...prev };
      delete next[num];
      return next;
    });
  };

  const handleSelectOption = (planId: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [planId]: option }));
    setCheckedPlan((prev) => (prev.includes(planId) ? prev : [...prev, planId]));
    // Reset any captured email if switching to a different choice
    setOptionEmails((prev) => ({ ...prev, [planId]: "" }));
    setOptionEmailErrors((prev) => ({ ...prev, [planId]: "" }));
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

    if (fieldId === "email") {
      setEmailAlreadyRegistered(false);
    }
  };

  const handleEmailBlur = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    try {
      setIsCheckingEmail(true);
      const isRegistered = await checkExistingRegistration(event._id, email);
      setEmailAlreadyRegistered(isRegistered);
      if (isRegistered) {
        setRegistrationErrors((prev) => ({
          ...prev,
          email: "Cet email est deja inscrit à cet evenement.",
        }));
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const baseFee = Number(event.price) || 0;
  const planSum =
    event.pricePlan && event.pricePlan.length > 0
      ? event.pricePlan.reduce((sum, item: any) => {
          if (!checkPlan?.includes(item._id!)) return sum;
          const selectedOptName = selectedOptions[item._id!];
          const optionExtra = selectedOptName
            ? (item.options?.find((o: any) => (typeof o === "object" ? o.name : o) === selectedOptName)?.price || 0)
            : 0;
          return sum + item.price + optionExtra;
        }, 0)
      : 0;
  // All-inclusive package plan overrides base fee + à-la-carte plans.
  const selectedPackagePlans = (event.pricePlan || []).filter(
    (p: any) => checkPlan.includes(p._id) && p.isPackage
  );
  const hasPackage = selectedPackagePlans.length > 0;
  const packageTotal = selectedPackagePlans.reduce(
    (s: number, p: any) => s + (Number(p.price) || 0),
    0
  );
  const price = hasPackage ? packageTotal : baseFee + planSum;

  // Payment methods enabled by the organizer (default: all enabled)
  const pm = (event.paymentMethods as any) || {};
  const showCardPayment = pm.card !== false;
  const showDoorpayPayment = pm.doorpay !== false;
  const showBankPayment = pm.bankTransfer !== false;

  // "Registration request only": a selected choice asks to hide payment buttons
  // and submit a pending registration request instead (e.g. lab payment by cheque).
  const isRegistrationRequest = (event.pricePlan || []).some((p: any) => {
    if (!checkPlan.includes(p._id)) return false;
    const optName = selectedOptions[p._id];
    const opt = (p.options as any[])?.find(
      (o: any) => (typeof o === "object" ? o.name : o) === optName
    );
    return opt && typeof opt === "object" && opt.registrationRequestOnly;
  });

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

    // Emails captured for options flagged requireEmail (e.g. lab payment)
    checkPlan.forEach((planId) => {
      const plan = event.pricePlan?.find((p) => p._id === planId);
      const selectedOptName = selectedOptions[planId];
      const selectedOpt = (plan?.options as any[])?.find(
        (o: any) => (typeof o === "object" ? o.name : o) === selectedOptName
      );
      if (selectedOpt && typeof selectedOpt === "object" && selectedOpt.requireEmail) {
        items.push({
          field: `optionEmail_${planId}`,
          label: `Email — ${selectedOptName}`,
          type: "email",
          value: (optionEmails[planId] || "").trim(),
        });
      }
    });

    return items;
  }, [
    getFieldLabel,
    registrationFields,
    registrationValues,
    shouldShowWorkSubmission,
    workChoice,
    workSummaryNote,
    workSummaryTitle,
    checkPlan,
    selectedOptions,
    optionEmails,
    event.pricePlan,
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
      discountType: event.discount.discountType || "percentage",
      discountTarget: event.discount.discountTarget || "all",
      discountPlanIds: event.discount.discountPlanIds || [],
    };
  }, [event.discount, registrationFields, registrationValues]);

  const calculatePriceAsNumber = (_unused?: number) => {
    const final = calcFinalPrice(baseFee, planSum, discountInfo, event.pricePlan as any[], checkPlan, selectedOptions);
    return Number.parseFloat(String(final)).toFixed(2);
  };

  const isFreeEvent = event.isFree || Number(calculatePriceAsNumber(price)) === 0;

  // Human-readable summary of what the applied preferential rate includes,
  // derived from how the organizer configured the discount.
  const discountBenefitText = (() => {
    if (!event.discount) return "";
    const type = event.discount.discountType || "percentage";
    const target = event.discount.discountTarget || "all";
    const val = Number(event.discount.discount) || 0;
    const isFull = type === "percentage" && val >= 100;
    const amount = type === "percentage" ? `${val}%` : `${val} ${currencyCode}`;
    if (target === "plan") {
      return isFull
        ? text("benefitPlansFree", "Vos plans/ateliers sélectionnés sont offerts.")
        : text("benefitPlans", `Remise de ${amount} sur les plans sélectionnés.`, { amount });
    }
    if (target === "inscription") {
      return isFull
        ? text("benefitInscriptionFree", "Frais d'inscription offerts.")
        : text("benefitInscription", `Remise de ${amount} sur les frais d'inscription.`, { amount });
    }
    return isFull
      ? text("benefitAllFree", "Inscription offerte.")
      : text("benefitAll", `Remise de ${amount} sur le total.`, { amount });
  })();

  const validateRegistration = async () => {
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
    } else if (email) {
      // Final check before proceeding
      try {
        const isRegistered = await checkExistingRegistration(event._id, email);
        setEmailAlreadyRegistered(isRegistered);
        if (isRegistered) {
          nextErrors.email = "Cet email est deja inscrit à cet evenement.";
        }
      } catch (error) {
        console.error("Error in final email validation:", error);
      }
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

  // Validate emails required by selected options (requireEmail flag).
  const validateOptionEmails = () => {
    const nextErrors: Record<string, string> = {};
    for (const planId of checkPlan) {
      const plan = event.pricePlan?.find((p) => p._id === planId);
      const selectedOptName = selectedOptions[planId];
      const selectedOpt = (plan?.options as any[])?.find(
        (o: any) => (typeof o === "object" ? o.name : o) === selectedOptName
      );
      if (selectedOpt && typeof selectedOpt === "object" && selectedOpt.requireEmail) {
        const value = (optionEmails[planId] || "").trim();
        if (!value) {
          nextErrors[planId] = text("requiredField", "Ce champ est obligatoire.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nextErrors[planId] = text("invalidEmail", "Veuillez saisir une adresse email valide.");
        }
      }
    }
    setOptionEmailErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = async () => {
    const registrationIsValid = await validateRegistration();
    const workIsValid = validateWorkSubmission();
    const optionsAreValid = validateOptions();
    const optionEmailsAreValid = validateOptionEmails();

    if (!optionsAreValid) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un choix pour le plan sélectionné.",
        variant: "destructive",
      });
      return false;
    }

    if (!optionEmailsAreValid) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir l'adresse email demandée pour le choix sélectionné.",
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

  const handleGetPreorder = async (asRequest = false) => {
    if (!(await validateAll())) {
      return;
    }

    try {
      setIsProcessing(true);
      const workReady = await persistWorkSummaryIfNeeded();
      if (!workReady) return;

      const details =
        event.pricePlan
          ?.filter((item) => checkPlan.includes(item._id!))
          .map((item) => {
            const selectedOptName = selectedOptions[item._id!];
            const optExtra = selectedOptName
              ? ((item.options as any[])?.find((o: any) => (typeof o === "object" ? o.name : o) === selectedOptName)?.price || 0)
              : 0;
            return {
              name: item.name,
              price: (item.price + optExtra).toString(),
              option: selectedOptName,
            };
          }) || [];

      const discountIsApplied = discountInfo && Number(discountInfo.value) > 0;
      const order = await createOrder({
        eventId: event._id,
        totalAmount: calculatePriceAsNumber(price),
        type: "doorpay",
        requiredUserInfo: builtRegistrationInfo,
        ...(discountIsApplied ? { discountInfo } : {}),
        ...(discountIsApplied ? { originalAmount: price } : {}),
        ...(discountIsApplied && discountProofUrl ? { discountProofUrl } : {}),
        ...(asRequest ? { pendingReview: true } : {}),
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

        <CardHeader className="items-center px-4 pb-1 pt-4">
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

        <CardContent className="space-y-3 px-3 pb-4">
          <div className="space-y-3">
            {baseFee > 0 && (
              <div className="rounded-[2rem] border border-border/50 bg-card/5 p-6 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-foreground">
                  {text("registrationFee", "Frais d'inscription")}
                </p>
                <div className="mt-2 text-center">
                  <span className="text-4xl font-black text-foreground">
                    {formatPriceByCountry(baseFee, event.country, "en-US", event.location)}
                  </span>
                </div>
                {(event as any).registrationFeeNote && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {(event as any).registrationFeeNote}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 rounded-3xl border border-border/60 bg-background/40 p-3">
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
                              onClick={() =>
                                handleRegistrationValueChange(
                                  String(field._id),
                                  isSelected ? "" : option
                                )
                              }
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
                      <div className="relative">
                        <Input
                          type={String(field._id) === "email" ? "email" : field.type === "number" ? "number" : "text"}
                          value={registrationValues[String(field._id)] || ""}
                          onChange={(e) => handleRegistrationValueChange(String(field._id), e.target.value)}
                          onBlur={(e) => String(field._id) === "email" && handleEmailBlur(e.target.value)}
                          placeholder={field.placeholder || getFieldLabel(String(field._id), field.label)}
                          className={`rounded-2xl ${String(field._id) === "email" && emailAlreadyRegistered ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {String(field._id) === "email" && isCheckingEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        )}
                      </div>
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

              {/* Unified preferential-rate card: what's applied, what it includes,
                  the required proof, and the pending-validation notice. */}
              {discountInfo && Number(discountInfo.value) > 0 && !hasPackage && (
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 to-green-50/40 dark:from-emerald-900/15 dark:to-green-900/10 p-4 space-y-3">
                  {/* Header: applied offer + benefit */}
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-500/15 p-2 shrink-0">
                      <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        {text("preferentialRateTitle", "Tarif préférentiel appliqué")}
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {discountInfo.fieldValue
                          ? `${discountInfo.fieldValue} — ${discountBenefitText}`
                          : discountBenefitText}
                      </p>
                    </div>
                  </div>

                  {/* Proof requirement + upload + pending notice */}
                  {(event.discount?.requireProof || !!event.discount?.proofDescription) && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-50/70 dark:bg-amber-900/10 p-3 space-y-2">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {text("proofRequiredTitle", "Justificatif requis")}
                      </p>
                      {event.discount?.proofDescription && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">{event.discount.proofDescription}</p>
                      )}
                      <label className="flex flex-col gap-2 cursor-pointer">
                        <div className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed text-sm font-medium transition-all ${
                          discountProofUrl
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-amber-300 bg-white/50 text-amber-700 hover:border-amber-500"
                        }`}>
                          {isUploadingProof ? (
                            <span className="animate-pulse">{text("uploading", "Téléchargement...")}</span>
                          ) : discountProofUrl ? (
                            <><CheckCircle className="h-4 w-4" /> {text("proofUploaded", "Justificatif téléchargé")}</>
                          ) : (
                            <><FileText className="h-4 w-4" /> {text("uploadProof", "Télécharger le justificatif")}</>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleProofUpload(e.target.files[0])}
                        />
                      </label>
                      <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80">
                        {text(
                          "pendingValidationNote",
                          "Votre inscription sera enregistrée puis validée après vérification de votre justificatif par l'organisateur. En cas de refus, le tarif plein s'appliquera."
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {event.pricePlan && event.pricePlan.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("selectPlans")}
                </p>
                {(event as any).pricePlanNote && (
                  <div className="flex gap-2 rounded-2xl border border-amber-400/30 bg-amber-50/40 dark:bg-amber-900/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                    <span className="shrink-0 mt-0.5">ℹ️</span>
                    <p>{(event as any).pricePlanNote}</p>
                  </div>
                )}
                <div className="grid gap-3">
                  {event.pricePlan.map((plan: any) => {
                    const isSelected = checkPlan.includes(plan._id);
                    return (
                      <div key={plan._id} className="flex flex-col gap-2">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => !isSelected && handleAddPlan(plan._id)}
                          className={`relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10 cursor-default"
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
                          <div className="flex items-center gap-2">
                            {(() => {
                              const hasPricedOptions = (plan.options || []).some(
                                (o: any) => (typeof o === "object" ? o.price || 0 : 0) > 0
                              );
                              // Hide the "0.00 TND" badge when the plan itself is free
                              // but its choices carry a price (shown per-option instead).
                              if (Number(plan.price) === 0 && hasPricedOptions) return null;
                              return (
                                <Badge
                                  variant={isSelected ? "default" : "secondary"}
                                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                                    isSelected ? "bg-primary text-primary-foreground" : ""
                                  }`}
                                >
                                  {formatPriceByCountry(plan.price, event.country, "en-US", event.location)}
                                </Badge>
                              );
                            })()}
                            {isSelected && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemovePlan(plan._id); }}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
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
                            <div className="flex flex-col gap-2">
                              {plan.options.map((opt: any, idx: number) => {
                                const optName = typeof opt === "object" ? opt.name : opt;
                                const optPrice = typeof opt === "object" ? (opt.price || 0) : 0;
                                const optPlaces = typeof opt === "object" ? opt.places : undefined;
                                const optDescription = typeof opt === "object" ? opt.description : undefined;
                                const isOptSelected = selectedOptions[plan._id] === optName;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectOption(plan._id, optName)}
                                    className={`flex flex-col gap-1 p-2 px-3 rounded-xl border transition-all text-xs text-left ${
                                      isOptSelected
                                        ? "border-primary bg-primary/10 text-primary font-medium"
                                        : "border-border/60 bg-background/50 hover:border-primary/40"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 w-full">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${isOptSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                                        <span>{optName}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {optPrice > 0 && (
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isOptSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                            +{formatPriceByCountry(optPrice, event.country, "en-US", event.location)}
                                          </span>
                                        )}
                                        {optPlaces !== undefined && (
                                          <span className="text-[10px] text-muted-foreground">
                                            {optPlaces} pl.
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {optDescription && (
                                      <p className={`text-[11px] leading-relaxed pl-5 font-normal ${isOptSelected ? "text-primary/80" : "text-muted-foreground"}`}>
                                        {optDescription}
                                      </p>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Required email input when the selected choice asks for it */}
                            {(() => {
                              const selectedOptName = selectedOptions[plan._id];
                              const selectedOpt = (plan.options as any[])?.find(
                                (o: any) => (typeof o === "object" ? o.name : o) === selectedOptName
                              );
                              if (!selectedOpt || typeof selectedOpt !== "object" || !selectedOpt.requireEmail) {
                                return null;
                              }
                              return (
                                <div className="mt-2 space-y-1">
                                  <Label className="text-xs font-medium text-foreground">
                                    {text("confirmationEmail", "Adresse email de confirmation")}
                                    <span className="ml-1 text-destructive">*</span>
                                  </Label>
                                  <Input
                                    type="email"
                                    value={optionEmails[plan._id] || ""}
                                    onChange={(e) => {
                                      setOptionEmails((prev) => ({ ...prev, [plan._id]: e.target.value }));
                                      setOptionEmailErrors((prev) => ({ ...prev, [plan._id]: "" }));
                                    }}
                                    placeholder="email@laboratoire.tn"
                                    className="rounded-xl text-sm"
                                  />
                                  {optionEmailErrors[plan._id] && (
                                    <p className="text-xs text-destructive">{optionEmailErrors[plan._id]}</p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isAvailable() && (
              isRegistrationRequest ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => void handleGetPreorder(true)}
                    disabled={isProcessing}
                    className="h-14 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5" />
                        {text("sendRegistrationRequest", "Envoyer la demande d'inscription")}
                      </div>
                    )}
                  </Button>
                </motion.div>
              ) : (
              <>
                {(isFreeEvent || showCardPayment) && (
                  <CheckoutButton
                    event={event}
                    checkPlan={checkPlan}
                    selectedOptions={selectedOptions}
                    discountInfo={discountInfo}
                    discountProofUrl={discountProofUrl}
                    requiredUserInfo={builtRegistrationInfo}
                    validateBeforeCheckout={validateAll}
                    beforeCheckout={persistWorkSummaryIfNeeded}
                  />
                )}

                {!isFreeEvent && showDoorpayPayment && (
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

                {!isFreeEvent && showBankPayment &&
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
                          .map((item) => {
                            const selectedOptName = selectedOptions[item._id!];
                            const optExtra = selectedOptName
                              ? ((item.options as any[])?.find((o: any) => (typeof o === "object" ? o.name : o) === selectedOptName)?.price || 0)
                              : 0;
                            return {
                              name: item.name,
                              price: (item.price + optExtra).toString(),
                              option: selectedOptName,
                            };
                          }) || []
                      }
                      requiredUserInfo={builtRegistrationInfo}
                      discountInfo={discountInfo}
                      validateBeforeOpen={validateAll}
                      beforeSubmit={persistWorkSummaryIfNeeded}
                    />
                  ))}
              </>
              )
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pb-2 pt-2 text-sm">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2">
              <CheckCircle size={14} className="text-green-500" />
              <span className="font-bold text-foreground">
                {event.isFree ? text("freeRegistration", "Inscription gratuite") : t("secureCheckout")}
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
