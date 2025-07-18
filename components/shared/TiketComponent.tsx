"use client";

import { Calendar, Clock, MapPin, User, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useTransition } from "react";
import { getOrderByEventAndBuyer } from "@/lib/actions/order.actions";
import { Skeleton } from "../ui/skeleton";
import {
  formatDateRange,
  formatDateTime,
  formatPrice,
  parseAddressManual,
} from "@/lib/utils";
import { QRCode } from "react-qrcode-logo";
import type { pricePlan } from "@/types";
import { useTranslations, useLocale } from "next-intl";

export default function TicketComponent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const t = useTranslations("ticket");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<any>(null);

  const getOrderDetails = async () => {
    try {
      startTransition(async () => {
        const order = await getOrderByEventAndBuyer(eventId, userId);
        setOrder(order);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, []);

  return (
    <div className={`flex justify-center p-4 md:p-8 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Paper ticket wrapper */}
      <div className="relative w-full max-w-[400px] rotate-0 transform transition-transform hover:rotate-1">
        {/* Paper texture and shadow effects */}
        <div className="absolute inset-0 -z-10 translate-y-1 rounded-lg bg-neutral-950/10 blur-sm"></div>
        <Card className="relative flex w-full flex-col overflow-hidden border-0 bg-[linear-gradient(to_bottom,#fff_0%,#f8f8f8_40%,#fff_100%)] shadow-none">
          {/* Noise texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              filter: "contrast(180%) brightness(90%)",
            }}
          />

          {/* Main Ticket Content */}
          <div className="relative p-6">
            <div className="mb-6 text-center">
              <Badge
                variant="outline"
                className={`mb-2 border-primary/30 bg-primary/5 text-primary ${
                  isRTL ? "font-arabic" : ""
                }`}
              >
                {t("admission.general")}
              </Badge>
              {isPending ? (
                <Skeleton className="mb-1 h-10 w-full max-w-sm bg-primary/10 font-serif text-4xl font-black tracking-tight text-primary" />
              ) : (
                <h1
                  className={`mb-1 font-serif text-4xl font-black tracking-tight text-primary ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {order?.event.title}
                </h1>
              )}
              {isPending ? (
                <Skeleton className="mb-2 h-4 w-full max-w-sm bg-primary/10 font-medium text-muted-foreground" />
              ) : (
                <p
                  className={`mb-2 font-medium text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {order?.event.location.name &&
                    parseAddressManual(order?.event.location.name)?.city}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4">
              {isPending ? (
                <DetailsSkeleton />
              ) : (
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p
                      className={`font-medium dark:text-muted ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {
                        formatDateRange(
                          order?.event.startDateTime,
                          order?.event.endDateTime
                        ).dateRange
                      }
                    </p>
                    <p
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {
                        formatDateRange(
                          order?.event.startDateTime,
                          order?.event.endDateTime
                        ).summary
                      }
                      {t("conference.dayPass")}
                    </p>
                  </div>
                </div>
              )}

              {isPending ? (
                <DetailsSkeleton />
              ) : (
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p
                      className={`font-medium dark:text-muted ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {formatDateTime(order?.event.startDateTime).timeOnly} -
                      {formatDateTime(order?.event.endDateTime).timeOnly}
                    </p>
                    <p
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("doors.openAt")}{" "}
                      {formatDateTime(order?.event.startDateTime).timeOnly}
                    </p>
                  </div>
                </div>
              )}

              {isPending ? (
                <DetailsSkeleton />
              ) : (
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p
                      className={`font-medium dark:text-muted ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {order?.event.location.name &&
                        parseAddressManual(order?.event.location.name)?.street}
                    </p>
                    <p
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {order?.event.location.name && order?.event.location.name}
                    </p>
                  </div>
                </div>
              )}

              {isPending ? (
                <DetailsSkeleton />
              ) : (
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p
                      className={`font-medium dark:text-muted ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {order?.buyer.firstName} {order?.buyer.lastName}
                    </p>
                    <p
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("checkIn.idRequired")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Event Details Section */}
            {order?.event.pricePlan && order?.event.pricePlan.length > 0 && (
              <div className="rounded-lg bg-muted/40 dark:bg-muted/90 p-4">
                <div className="grid gap-3">
                  <div
                    className={`flex items-start gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Gift className="mt-0.5 h-4 w-4 text-primary" />
                    <div
                      className={`text-sm text-muted-foreground ${
                        isRTL ? "text-right" : ""
                      }`}
                    >
                      <p
                        className={`mb-1 font-medium ${
                          isRTL ? "font-arabic" : ""
                        }`}
                      >
                        {t("included.title")}
                      </p>
                      <ul className="grid gap-1">
                        {order?.event.pricePlan?.map(
                          (plan: pricePlan, index: number) => (
                            <li
                              key={index}
                              className={isRTL ? "font-arabic" : ""}
                            >
                              • {plan.name} - {formatPrice(plan?.price, "TND")}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`mt-6 flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span className="font-mono text-lg font-bold text-primary">
                {order?.event.isFree && t("price.free")}
                {Number.parseFloat(order?.event.price) > 0 &&
                  formatPrice(order?.event.price, "TND")}
                {order?.event.pricePlan.length > 0 &&
                  formatPrice(
                    order?.event.pricePlan.reduce(
                      (sum: number, plan: pricePlan) => sum + plan.price,
                      0
                    ),
                    "TND"
                  )}
              </span>
              {isPending ? (
                <Skeleton className="w-full h-8" />
              ) : (
                <span
                  className={`font-mono text-xs text-muted-foreground ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("order.label")}: RC-{order && order._id}
                </span>
              )}
            </div>
          </div>

          {/* Perforation line */}
          <div className="relative">
            <div className="absolute inset-x-0 w-full h-8 top-2">
              <div className="flex h-full w-full -translate-y-1/2 flex-row justify-evenly">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="h-4 w-4 rounded-full bg-card"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Stub */}
          <div className="relative bg-muted/20 p-6">
            <div className="flex flex-col items-center gap-4">
              {/* QR Code */}
              {isPending ? (
                <Skeleton className="h-32 w-32 overflow-hidden rounded-lg border bg-muted/10 p-2 shadow-sm" />
              ) : (
                <div className="relative flex h-32 w-32 overflow-hidden rounded-lg border items-center justify-center bg-white p-2 shadow-sm">
                  <QRCode
                    value={order?._id}
                    size={100}
                    logoImage={`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/images/qrcodeMotif.png`}
                    removeQrCodeBehindLogo={false}
                    logoPadding={3}
                    logoPaddingStyle="square"
                    logoWidth={20}
                    qrStyle="fluid"
                    eyeRadius={6}
                    fgColor="#64748b"
                    bgColor="#f8fafc"
                    ecLevel="H"
                    quietZone={10}
                  />
                </div>
              )}

              <div
                className={`flex gap-8 text-center ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div>
                  <p
                    className={`font-serif text-lg font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("seating.row")}
                  </p>
                  <p className="text-2xl font-bold text-primary">A12</p>
                </div>
                <div>
                  <p
                    className={`font-serif text-lg font-bold ${
                      isRTL ? "font-arabic" : ""
                    }`}
                  >
                    {t("seating.seat")}
                  </p>
                  <p className="text-2xl font-bold text-primary">24</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const DetailsSkeleton = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Skeleton className="h-full w-full bg-primary/10 rounded-md" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-4 w-full bg-muted/10" />
        <Skeleton className="h-4 w-full bg-muted-foreground/10" />
      </div>
    </div>
  );
};
