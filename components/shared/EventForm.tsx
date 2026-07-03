"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eventFormSchema } from "@/lib/validator";
import * as z from "zod";
import { eventDefaultValues } from "@/constants";
import Dropdown from "./Dropdown";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./FileUploader";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import OrganisationDropdown from "./OrganisationDropdown";

import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/database/models/event.model";
import { MinimalTiptapEditor } from "../minimal-tiptap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import GoogleMapComponent from "./GoogleMap";
import { CalendarIcon, Disc, Landmark, LinkIcon, ListChecks, MapPin, Plus, StickyNote, Trash2 } from "lucide-react";
import PricePlanComponent from "./PricePlanComponent";
import { pricePlan } from "@/types";
import FormBuilder from "./FormBuilder";
import { SelectPills } from "../ui/currency-select";
import { useGetSponsors } from "@/hooks/useGetSponsors";
import { useGetFields } from "@/hooks/useGetFields";

import { Separator } from "../ui/separator";
import { Card, CardContent } from "../ui/card";
import { countryGovernorates } from "@/constants/country-governorates";
import { CountryDropdown } from "../ui/country-dropdown";
import { Value } from "@radix-ui/react-select";
import DiscountDialog from "./DiscountDialogComponenet";
import { useLocale, useTranslations } from "next-intl";
import { useLoadScript } from "@react-google-maps/api";
import ScanPointsConfig from "./ScanPointsConfig";
import { eventUrl, getCurrencyCodeByCountry } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventFormProps = {
  userId: string;
  type: "Create" | "Update";
  event?: IEvent;
  eventId?: string;
  organisationId?: string | null;
  onOrganisationChange?: (id: string) => void;
};

const EventForm = ({
  userId,
  type,
  event,
  eventId,
  organisationId,
  onOrganisationChange,
}: EventFormProps) => {
  const [address, setAddress] = useState("our location");
  const [latitude, setLatitude] = useState(34.739822);
  const [longitude, setLongitude] = useState(10.7600196);
  const [files, setFiles] = useState<File[]>([]);
  const [pricePlan, setPricePlan] = useState<pricePlan[]>([]);
  const [pricePlanNote, setPricePlanNote] = useState<string>("");
  const [isPricePlan, setIsPricePlan] = useState<boolean>(false);
  const [reel, setReel] = useState<string>("");

  // When toggling to price plan mode, set a default price so Zod validation doesn't block submission
  const handleSetIsPricePlan: Dispatch<SetStateAction<boolean>> = (value) => {
    const resolved = typeof value === "function" ? value(isPricePlan) : value;
    setIsPricePlan(resolved);
    if (resolved) {
      form.setValue("price", "0");
    }
  };
  const initialValues =
    event && type === "Update"
      ? {
        ...event,
        organisationId: (event.organisation as any)?._id || organisationId || "",
        categoryId: (event.category as any)?._id || (event as any).categoryId || "",
        country: event.country || "TUN",
        allowGuestRegistration: event.allowGuestRegistration ?? true,
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime),
        discount: event.discount
          ? {
              ...event.discount,
              discount: String(event.discount.discount ?? ""),
            }
          : undefined,
      }
      : {
        ...eventDefaultValues,
        organisationId: organisationId || "",
      };
  const router = useRouter();

  useEffect(() => {
    if (event?.pricePlan && event.pricePlan.length > 0 && type === "Update") {
      setIsPricePlan(true);
      setPricePlan(event.pricePlan);
      if ((event as any).pricePlanNote) setPricePlanNote((event as any).pricePlanNote);
    }
  }, []);

  type EventFormValues = z.infer<typeof eventFormSchema>;

  const form = useForm<EventFormValues, any, EventFormValues>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: initialValues as any,
  });

  useEffect(() => {
    if (!form.getValues("country")) {
      form.setValue("country", "TUN", {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    console.log(values);
    const resolvedCountry = values.country || form.getValues("country") || "TUN";

    if (type === "Create") {
      try {
        const newEvent = await createEvent({
          event: {
            ...values,
            country: resolvedCountry,
            pricePlan: pricePlan,
            pricePlanNote: pricePlanNote || undefined,
            location: { name: address, lon: longitude, lat: latitude },
            imageUrl: reel,
            scanPoints: values.scanPoints,
            organisationId: values.organisationId,
          },
          userId,
          path: "/profile",
        });

        if (newEvent) {
          form.reset();
          router.push(eventUrl(newEvent));
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (type === "Update") {
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: {
            ...values,
            country: resolvedCountry,
            pricePlan: pricePlan,
            pricePlanNote: pricePlanNote || undefined,
            location: { name: address, lon: longitude, lat: latitude },
            imageUrl: reel || values.imageUrl,
            _id: eventId,
            scanPoints: values.scanPoints,
          },
          path: `/events/${eventId}`,
        });

        if (updatedEvent) {
          //form.reset();
          // router.push(`/events/${updatedEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  useEffect(() => {
    if (address.length > 0) {
      // alert("setting field value");
      form.setValue("location", {
        name: address,
        lon: longitude,
        lat: latitude,
      });
    }
  }, [address, event, latitude, longitude]);
  const { data: sponsors, isLoading } = useGetSponsors(null, null);
  const { data: fields, isLoading: isLoadingFields } = useGetFields(userId);
  useEffect(() => {
    console.log(sponsors, fields);
  }, [sponsors, fields]);
  const t = useTranslations("eventForm");
  const guestRegistrationTitle = t.has("guestRegistration.title")
    ? t("guestRegistration.title")
    : "Allow registration without account";
  const guestRegistrationDescription = t.has("guestRegistration.description")
    ? t("guestRegistration.description")
    : "If enabled, attendees can complete their registration without signing in to the app.";
  const editorPlaceholder = t("eventDescriptionPlaceholder");
  const locale = useLocale();
  const selectedCountry = form.watch("country") || "TUN";
  const currencyCode = getCurrencyCodeByCountry(selectedCountry);
  const pricePlaceholderLabel = t("price").replace(/\s*\([^)]*\)\s*$/, "");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          console.log("errors", e);
        })}
        className="flex flex-col gap-5 rounded-3xl p-5"
      >
        {type === "Update" && (
          <FormField
            control={form.control}
            name="organisationId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <OrganisationDropdown
                    userId={userId}
                    onChangeHandler={(id) => {
                      field.onChange(id);
                      if (onOrganisationChange) onOrganisationChange(id);
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <CountryDropdown
                    placeholder="Country"
                    defaultValue={field.value || "TUN"}
                    onChange={(country) => {
                      field.onChange(country.alpha3);
                    }}
                    className="input-field glass w-full flex items-center "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder={t("eventTitle")}
                    {...field}
                    className="input-field glass"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Dropdown
                    onChangeHandler={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <div className="flex flex-col gap-5 w-full max-w-2xl">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full h-full">
                  <FormControl className="h-full">
                    <MinimalTiptapEditor
                      key={`editor-${locale}`}
                      value={field.value}
                      onChange={(e) => field.onChange(e)}
                      className="w-full  backdrop-blur-lg bg-white/10 backdrop-brightness-200"
                      editorContentClassName="p-5"
                      output="html"
                      placeholder={editorPlaceholder}
                      autofocus={true}
                      editable={true}
                      editorClassName="focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full glass  px-4 py-2">
                      <AlertDialog>
                        <AlertDialogTrigger className="w-full flex flex-row items-center">
                          <MapPin className="mr-2" />
                          <Input
                            placeholder={t("locationPlaceHolder")}
                            className="input-field w-full hidden"
                            value={JSON.stringify(field.value)}
                            readOnly
                          />
                          <span className=" text-center w-full text-sm">
                            {address.length > 0 ||
                              (field.value &&
                                field.value.name &&
                                field.value.name.length > 0)
                              ? address!.length > 0 ||
                              (field.value &&
                                field.value.name &&
                                field.value.name.length > 0)
                              : t("locationPlaceHolder")}
                          </span>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="bg-card wrapper">
                          <GoogleMapComponent
                            radius={500}
                            latitude={latitude}
                            longitude={longitude}
                            setLatitude={setLatitude}
                            setLongitude={setLongitude}
                            address={address}
                            setAddress={setAddress}
                            style={{
                              width: "100%",
                              height: "100%",
                              pointerEvents: "auto",
                            }}
                          />{" "}
                          <AlertDialogFooter className="absolute glass items-center justify-center right-3 bottom-3  h-12 w-12 rounded-full">
                            <AlertDialogAction className="glass text-white rounded-full h-12 w-12 ">
                              OK
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        <FormField
                          control={form.control}
                          name="isOnline"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center">
                                  <label
                                    htmlFor="isOnline"
                                    className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {t("online")}
                                  </label>
                                  <Checkbox
                                    onCheckedChange={field.onChange}
                                    checked={field.value}
                                    id="isOnline"
                                    className="mr-2 h-5 w-5 border-2 border-primary-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AlertDialog>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder={t("city")}
                        {...field}
                        className="input-field glass"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder={t("village")}
                        {...field}
                        className="input-field glass"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center glass !backdrop-filter-none  h-[54px] w-full overflow-hidden rounded-full  px-4 py-2">
                      <CalendarIcon />
                      <p className="ml-3 whitespace-nowrap ">
                        {t("startDate")}
                      </p>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px]  glass !backdrop-filter-none w-full overflow-hidden rounded-full  px-4 py-2">
                      <CalendarIcon />
                      <p className="ml-3 whitespace-nowrap ">{t("endDate")}</p>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPricePlan ? (
              <PricePlanComponent
                setPricePlan={setPricePlan}
                pricePlan={pricePlan}
                setIsPricePlan={handleSetIsPricePlan}
                currencyCode={currencyCode}
                globalNote={pricePlanNote}
                setGlobalNote={setPricePlanNote}
              />
            ) : (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <div className="flex-center md:h-[54px] w-full flex flex-col md:flex-row  glass overflow-hidden md:rounded-full rounded-xl gap-2  px-4 py-2">
                        <Image
                          src="/assets/icons/dollar.svg"
                          alt="dollar"
                          width={24}
                          height={24}
                          className="filter-grey"
                        />
                        <Input
                          type="number"
                          disabled={form.getValues("isFree")}
                          placeholder={`${pricePlaceholderLabel} (${currencyCode})`}
                          {...field}
                          className="p-regular-16 border-0 glass rounded-full  outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <FormField
                          control={form.control}
                          name="places"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <Input
                                type="number"
                                min={0}
                                placeholder={t("places")}
                                {...field}
                                className="p-regular-16 border-0 glass rounded-full  outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </FormItem>
                          )}
                        />
                        <Button
                          onClick={() => handleSetIsPricePlan(true)}
                          type="button"
                          variant={"outline"}
                          className="border-2  gap-1 rounded-full mx-1 bg-pink-500"
                          disabled={form.getValues("isFree")}
                        >
                          <ListChecks />
                          {t("plans")}
                        </Button>
                        <FormField
                          control={form.control}
                          name="isFree"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center">
                                  <label
                                    htmlFor="isFree"
                                    className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {t("freeTicket")}
                                  </label>
                                  <Checkbox
                                    onCheckedChange={field.onChange}
                                    checked={field.value}
                                    id="isFree"
                                    className="mr-2 h-5 w-5 border-2 border-primary-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="registrationFeeNote"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full glass px-4 py-2">
                      <StickyNote className="text-muted-foreground" />
                      <Input
                        placeholder={t.has("registrationFeeNote") ? t("registrationFeeNote") : "Note des frais d'inscription (ex: Inscription + congrès + déjeuner + pauses café)"}
                        {...field}
                        value={field.value ?? ""}
                        className="input-field !bg-transparent"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full rounded-2xl glass px-4 py-3 space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                {t.has("paymentMethodsLabel") ? t("paymentMethodsLabel") : "Méthodes de paiement affichées"}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                {([
                  { key: "card", label: "Paiement en ligne (carte)" },
                  { key: "doorpay", label: "Paiement à la porte" },
                  { key: "bankTransfer", label: "Virement bancaire" },
                ] as const).map((m) => {
                  const pm = (form.watch("paymentMethods") as any) || {};
                  const checked = pm[m.key] !== false; // default enabled
                  return (
                    <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          form.setValue("paymentMethods", {
                            ...((form.getValues("paymentMethods") as any) || {}),
                            [m.key]: v === true,
                          })
                        }
                      />
                      <span className="text-sm">{m.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full glass  px-4 py-2">
                      <LinkIcon />

                      <Input
                        placeholder={t("url")}
                        {...field}
                        value={field.value ?? ""}
                        className="input-field !bg-transparent"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col w-full ">
            <div className="w-full">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl className="h-full">
                      <FileUploader
                        setReel={setReel}
                        onFieldChange={field.onChange}
                        imageUrl={field.value}
                        setFiles={setFiles}
                        userId={userId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              {fields && (
                <Card className="w-full mt-5 flex flex-col items-center justify-center pt-4 backdrop-blur bg-white/30 rounded-3xl backdrop-brightness-100">
                  <CardContent className="bg-transparent w-full">
                    <FormField
                      control={form.control}
                      name="requiredInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("requiredInfo")}</FormLabel>
                          <FormDescription>
                            {t("requiredInfoDescription")}
                          </FormDescription>
                          <Separator className="my-4" />
                          <FormControl>
                            <SelectPills
                              data={fields}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={t("searchInfoPlaceholder")}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator className="my-4" />

                    <DiscountDialog form={form} fields={fields} pricePlans={pricePlan} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="w-full">
              <Card className="w-full mt-5 flex flex-col items-center justify-center pt-4 backdrop-blur bg-white/30 rounded-3xl backdrop-brightness-100">
                <CardContent className="bg-transparent w-full space-y-6">
                  <div className="flex flex-col gap-2">
                    <FormLabel className="text-base font-bold">{t("registrationConfig.title")}</FormLabel>
                    <FormDescription>
                      {t("registrationConfig.description")}
                    </FormDescription>
                  </div>
                  <Separator />
                  
                  <div className="space-y-6">
                    {/* Basic Fields Visibility */}
                    <FormField
                      control={form.control}
                      name="disabledBaseFields"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { id: "jobTitle", label: t("registrationConfig.fields.jobTitle") },
                              { id: "republic", label: t("registrationConfig.fields.republic") },
                              { id: "village", label: t("registrationConfig.fields.village") },
                              { id: "maskRepublicLabel", label: t("registrationConfig.fields.maskRepublicLabel") },
                            ].map((item) => {
                              const value = field.value || [];
                              const isHidden = value.includes(item.id);
                              return (
                                <div key={item.id} className="flex items-center space-x-2 bg-background/40 p-3 rounded-xl border border-border/40 hover:bg-background/60 transition-colors">
                                  <Checkbox
                                    id={item.id}
                                    checked={!isHidden}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (!checked) {
                                        field.onChange([...current, item.id]);
                                      } else {
                                        field.onChange(current.filter((i) => i !== item.id));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={item.id} className="text-sm font-medium leading-none cursor-pointer flex-1 py-1">
                                    {item.label}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Job Title Label Override */}
                      <FormField
                        control={form.control}
                        name="jobTitleLabel"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>{t("registrationConfig.fields.jobTitle")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t("registrationConfig.fields.jobTitleLabelPlaceholder")} 
                                {...field} 
                                className="bg-background/40 rounded-xl border-border/40"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Default Republic Selection */}
                      <FormField
                        control={form.control}
                        name="selectedRepublic"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>{t("registrationConfig.fields.selectedRepublic")}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "none"}>
                              <FormControl>
                                <SelectTrigger className="bg-background/40 rounded-xl border-border/40">
                                  <SelectValue placeholder={t("registrationConfig.fields.selectedRepublic")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">{t("registrationConfig.fields.none")}</SelectItem>
                                {Object.keys(countryGovernorates).map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Custom Registration Fields */}
                    <FormField
                      control={form.control}
                      name="customRegistrationFields"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-base">{t("registrationConfig.fields.customFields.title")}</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-dashed"
                              onClick={() => {
                                const current = field.value || [];
                                field.onChange([...current, { label: "", isRequired: false }]);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("registrationConfig.fields.customFields.addField")}
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {(field.value || []).map((customField: any, index: number) => (
                              <div key={index} className="flex gap-4 items-start bg-background/20 p-4 rounded-2xl border border-border/20">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder={t("registrationConfig.fields.customFields.labelPlaceholder")}
                                    value={customField.label}
                                    onChange={(e) => {
                                      const current = field.value || [];
                                      const newList = [...current];
                                      if (newList[index]) {
                                        newList[index].label = e.target.value;
                                        field.onChange(newList);
                                      }
                                    }}
                                    className="bg-background/40 rounded-xl border-border/40"
                                  />
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`required-${index}`}
                                      checked={customField.isRequired}
                                      onCheckedChange={(checked) => {
                                        const newList = [...field.value];
                                        newList[index].isRequired = !!checked;
                                        field.onChange(newList);
                                      }}
                                    />
                                    <Label htmlFor={`required-${index}`} className="text-sm cursor-pointer whitespace-nowrap">
                                      {t("registrationConfig.fields.customFields.isRequired")}
                                    </Label>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                    onClick={() => {
                                      const newList = field.value.filter((_: any, i: number) => i !== index);
                                      field.onChange(newList);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card className="w-full mt-5 flex flex-col items-center justify-center pt-4 backdrop-blur bg-white/30 rounded-3xl backdrop-brightness-100">
                <CardContent className="bg-transparent w-full">
                  <FormField
                    control={form.control}
                    name="allowGuestRegistration"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value !== false}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                              id="allowGuestRegistration"
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel
                              htmlFor="allowGuestRegistration"
                              className="cursor-pointer"
                            >
                              {guestRegistrationTitle}
                            </FormLabel>
                            <FormDescription>
                              {guestRegistrationDescription}
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="showProfileButton"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-4 h-full">
                            <FormControl>
                              <Checkbox
                                checked={field.value !== false}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true)
                                }
                                id="showProfileButton"
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel
                                htmlFor="showProfileButton"
                                className="cursor-pointer"
                              >
                                {t("showProfileButton.title")}
                              </FormLabel>
                              <FormDescription>
                                {t("showProfileButton.description")}
                              </FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="showReturnButton"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-4 h-full">
                            <FormControl>
                              <Checkbox
                                checked={field.value !== false}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true)
                                }
                                id="showReturnButton"
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel
                                htmlFor="showReturnButton"
                                className="cursor-pointer"
                              >
                                {t("showReturnButton.title")}
                              </FormLabel>
                              <FormDescription>
                                {t("showReturnButton.description")}
                              </FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator className="my-4" />
                  <FormField
                    control={form.control}
                    name="showWorkSubmissionPopup"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                              id="showWorkSubmissionPopup"
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel
                              htmlFor="showWorkSubmissionPopup"
                              className="cursor-pointer"
                            >
                              {t("workSubmission.title")}
                            </FormLabel>
                            <FormDescription>
                              {t("workSubmission.description")}
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              {sponsors && (
                <Card className="w-full mt-5 flex flex-col items-center justify-center pt-4 backdrop-blur bg-white/30 rounded-3xl backdrop-brightness-100">
                  <CardContent className="bg-transparent w-full">
                    <FormField
                      control={form.control}
                      name="sponsors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("selectYourSponsors")}</FormLabel>{" "}
                          <FormDescription>
                            {t("chooseSponsors")}
                          </FormDescription>
                          <Separator className="my-4" />
                          <FormControl>
                            <SelectPills
                              data={sponsors}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                console.log(value);
                              }}
                              placeholder={t("searchSponsorsPlaceholder")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator className="my-4" />
                    <ScanPointsConfig form={form} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
          variant={"outline"}
        >
          {form.formState.isSubmitting
            ? t("submitting")
            : `${t(type)} ${t("event")}`}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
