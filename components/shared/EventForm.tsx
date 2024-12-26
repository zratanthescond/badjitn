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
import { useEffect, useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { useUploadThing } from "@/lib/uploadthing";

import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
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
import { ListChecks } from "lucide-react";
import PricePlanComponent from "./PricePlanComponent";
import { pricePlan } from "@/types";

type EventFormProps = {
  userId: string;
  type: "Create" | "Update";
  event?: IEvent;
  eventId?: string;
};

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(34.739822);
  const [longitude, setLongitude] = useState(10.7600196);
  const [files, setFiles] = useState<File[]>([]);
  const [pricePlan, setPricePlan] = useState<pricePlan[]>([]);
  const [isPricePlan, setIsPricePlan] = useState<boolean>(false);
  const [reel, setReel] = useState<string>("");
  const initialValues =
    event && type === "Update"
      ? {
          ...event,
          pricePlan: pricePlan,
          startDateTime: new Date(event.startDateTime),
          endDateTime: new Date(event.endDateTime),
        }
      : eventDefaultValues;
  const router = useRouter();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    alert("form submitted");

    alert(JSON.stringify(values));

    if (type === "Create") {
      try {
        const newEvent = await createEvent({
          event: {
            ...values,
            pricePlan: pricePlan,
            location: { name: address, lon: longitude, lat: latitude },
            imageUrl: reel,
          },
          userId,
          path: "/profile",
        });

        if (newEvent) {
          //  form.reset();
          // router.push(`/events/${newEvent._id}`);
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
        alert(JSON.stringify(pricePlan));
        const updatedEvent = await updateEvent({
          userId,
          event: {
            ...values,
            pricePlan: pricePlan,

            imageUrl: values.imageUrl,
            _id: eventId,
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
      alert("setting field value");
      form.setValue("location", {
        name: address,
        lon: longitude,
        lat: latitude,
      });
    }
  }, [address, event, latitude, longitude]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Event title"
                    {...field}
                    className="input-field"
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
                      value={field.value}
                      onChange={(e) => field.onChange(e)}
                      className="w-full"
                      editorContentClassName="p-5"
                      output="html"
                      placeholder="Type your description here..."
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
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <AlertDialog>
                        <AlertDialogTrigger className="w-full flex flex-row items-center">
                          <Image
                            src="/assets/icons/location-grey.svg"
                            alt="calendar"
                            width={24}
                            height={24}
                          />
                          <Input
                            placeholder="Event location or Online"
                            {...field}
                            className="input-field w-full hidden"
                            value={JSON.stringify(field.value)}
                          />
                          <span className="text-grey-600 text-center w-full text-sm">
                            {address.length > 0 || field.name.length > 0
                              ? address || field.value?.name
                              : "Event location or Online"}
                          </span>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="bg-indigo-500  wrapper">
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
                                    Online
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
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">
                        Start Date:
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
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">
                        End Date:
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
            {isPricePlan ? (
              <PricePlanComponent
                setPricePlan={setPricePlan}
                pricePlan={pricePlan}
                setIsPricePlan={setIsPricePlan}
              />
            ) : (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image
                          src="/assets/icons/dollar.svg"
                          alt="dollar"
                          width={24}
                          height={24}
                          className="filter-grey"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          {...field}
                          className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                          onClick={() => setIsPricePlan(true)}
                          type="button"
                          variant={"outline"}
                          className="border-2 p-1 gap-1 border-primary-500 text-primary-500 mx-1"
                        >
                          <ListChecks />
                          Plans
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
                                    Free Ticket
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
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/link.svg"
                        alt="link"
                        width={24}
                        height={24}
                      />

                      <Input
                        placeholder="URL"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Event `}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
