"use client";

import { useUser } from "@/lib/actions/user.actions";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import type { IUser } from "@/lib/database/models/user.model";
import { Skeleton } from "../ui/skeleton";
import { getEventById } from "@/lib/actions/event.actions";
import type { IEvent } from "@/lib/database/models/event.model";
import { QRCode } from "react-qrcode-logo";
import { Button } from "../ui/button";
import { useTransition } from "react";
import {
  createCertification,
  getCertificationByUseridAndEventId,
} from "@/lib/actions/certification.actions";
import { toast } from "@/hooks/use-toast";
import type { ICertificate } from "@/lib/database/models/certification.model";
import { Badge } from "../ui/badge";
import { Download, Printer, Award } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import generatePDF from "react-to-pdf";
import { useTranslations, useLocale } from "next-intl";

export default function CertificationComponent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const t = useTranslations("certification");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [user, setUser] = useState<IUser | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [qrcodeContent, setQrcodeContent] = useState<string | undefined>(
    "sample"
  );
  const [certification, setCertification] = useState<ICertificate | null>(null);

  const getCertification = () => {
    startTransition(async () => {
      const certificationHook = await getCertificationByUseridAndEventId({
        eventId,
        userId,
      });
      const userHook = await useUser();
      const eventHook = await getEventById(eventId);
      setUser(JSON.parse(JSON.stringify(userHook)));
      setEvent(JSON.parse(JSON.stringify(eventHook)));
      if (certificationHook) {
        console.log("Certification found:", certificationHook);
        // Ensure the certification is parsed correctly
        setCertification(certificationHook);
      } else {
        setCertification(null);
      }
    });
  };

  useEffect(() => {
    getCertification();
  }, []);

  useEffect(() => {
    if (certification && certification.status === "approved") {
      setQrcodeContent(certification._id);
    }
  }, [certification]);

  const requestCertification = () => {
    startTransition(async () => {
      const certification = await createCertification({ eventId, userId });
      if (certification) {
        toast({
          title: t("toast.success"),
          description: t("toast.certificationRequested"),
        });
      }
    });
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 justify-center h-full min-h-[80vh] bg-background px-4 py-12 sm:px-6 lg:px-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      <div
        ref={contentRef}
        className="w-full flex flex-col items-center justify-between min-h-[80vh] bg-card p-8 rounded-lg shadow-lg"
      >
        <div className="flex flex-col items-center justify-between h-2/3">
          <h1
            className={`text-3xl font-bold dark:text-white mb-4 ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("title")}
          </h1>
          <Separator className="my-4" />
          {user ? (
            <h2
              className={`text-5xl font-bold text-foreground mb-6 capitalize ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {`${user?.firstName} ${user?.lastName}`}
            </h2>
          ) : (
            <Skeleton className="h-12 w-3/4 rounded-full" />
          )}
          {event ? (
            <p
              className={`text-muted-foreground text-lg max-w-[600px] text-center mb-8 ${
                isRTL ? "font-arabic" : ""
              }`}
            >
              {t("description.part1")} "{event?.title}" {t("description.part2")}
            </p>
          ) : (
            <>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
            </>
          )}
        </div>

        <div
          className={`border-t w-full border-muted pt-6 flex ${
            isRTL ? "flex-row-reverse" : "flex-row"
          } justify-between items-center`}
        >
          <p
            className={`text-muted-foreground text-sm ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("awardedOn")}{" "}
            {certification && certification.updatedAt
              ? new Date(certification.updatedAt).toLocaleDateString(locale)
              : new Date().toLocaleDateString(locale)}
          </p>

          <div
            className={`flex items-center justify-between gap-2 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <Award className="w-6 h-6 text-primary" />
            {event ? (
              <>
                <p
                  className={`text-muted-foreground text-sm ${
                    isRTL ? "font-arabic" : ""
                  }`}
                >
                  {t("organizer")}: {event?.organizer.firstName}{" "}
                  {event?.organizer.lastName}
                </p>
                <QRCode
                  value={qrcodeContent}
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
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-36 rounded-full bg-slate-50" />
                <Skeleton className="h-10 w-10 rounded-sm" />
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`w-full flex flex-col md:flex-row items-center justify-between min-h-[15vh] bg-card p-8 rounded-lg shadow-lg ${
          isRTL ? "md:flex-row-reverse" : ""
        }`}
      >
        {certification === null && (
          <p
            className={`text-muted-foreground text-sm ${
              isRTL ? "font-arabic" : ""
            }`}
          >
            {t("sampleNote")}
          </p>
        )}

        {certification ? (
          certification.status === "pending" ? (
            <Badge
              className={`h-8 p-2 ${isRTL ? "font-arabic" : ""}`}
              title={t("status.processing")}
            >
              {t("status.processing")}
            </Badge>
          ) : certification.status === "approved" ? (
            <div
              className={`flex items-center justify-center gap-2 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Badge
                className={`h-8 p-2 bg-green-500 ${isRTL ? "font-arabic" : ""}`}
                title={t("status.approved")}
              >
                {t("status.approved")}
              </Badge>
              <Button
                variant={"ghost"}
                className="glass"
                onClick={() => {
                  reactToPrintFn();
                }}
                title={t("actions.print")}
              >
                <Printer />
              </Button>
              <Button
                variant={"ghost"}
                className="glass"
                onClick={() => {
                  generatePDF(contentRef, {
                    filename: `certification_${user?.firstName}_${user?.lastName}_.pdf`,
                    page: {
                      format: "A4",
                      orientation: "landscape",
                      margin: 0,
                    },
                    canvas: {
                      mimeType: "image/png",
                      qualityRatio: 1,
                    },
                  });
                }}
                title={t("actions.download")}
              >
                <Download />
              </Button>
            </div>
          ) : (
            <Badge
              variant={"destructive"}
              className={`h-8 p-2 ${isRTL ? "font-arabic" : ""}`}
              title={t("status.rejected")}
            >
              {t("status.rejected")}
            </Badge>
          )
        ) : (
          <Button
            variant={"ghost"}
            className={`glass flex items-center justify-between ${
              isRTL ? "flex-row-reverse font-arabic" : "flex-row"
            }`}
            size={"lg"}
            disabled={isPending}
            onClick={() => requestCertification()}
          >
            <Award className="w-8 h-8 text-primary" />
            {t("actions.orderCertification")}
          </Button>
        )}
      </div>
    </div>
  );
}
