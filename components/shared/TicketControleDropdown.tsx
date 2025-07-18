"use client";
import { useTranslations, useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { CogIcon, FileBadge, Folder, QrCode } from "lucide-react";
import WorkUploader from "./WorkUploader";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import CertificationComponent from "./CertificationComponent";
import TiketComponent from "./TiketComponent";

export default function TicketControleDropdown({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const t = useTranslations("TicketControle");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [opendropdown1, setOpenDropdown1] = useState<boolean>(false);
  const closeDropdown1 = (v: boolean) => setOpenDropdown1(v);
  const [opendropdown2, setOpenDropdown2] = useState<boolean>(false);
  const closeDropdown2 = (v: boolean) => setOpenDropdown2(v);
  const [opendropdown3, setOpenDropdown3] = useState<boolean>(false);
  const closeDropdown3 = (v: boolean) => setOpenDropdown3(v);

  return (
    <div
      className="flex justify-center items-center mt-16 z-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <DropdownMenu
        modal={false}
        open={opendropdown1}
        onOpenChange={(v) => {
          closeDropdown1(v);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            size={"icon"}
            className="absolute top-2 left-2 glass rounded-full z-50 w-10 h-10 p-0"
            aria-label={t("accessibility.settingsButton")}
          >
            <CogIcon className="h-6 w-6 stroke-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`flex glass flex-col items-center justify-center border-none p-2`}
        >
          <Dialog onOpenChange={closeDropdown1}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                className="flex items-center w-full"
                onSelect={(e) => e.preventDefault()}
              >
                <Folder className="mr-2 h-4 w-4" /> {t("actions.uploadWork")}
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent
              className={`flex w-full max-w-7xl items-center justify-center glass h-full border-none p-0`}
            >
              <DialogHeader className="sr-only">
                <DialogTitle>{t("dialogs.uploadWork.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialogs.uploadWork.description")}
                </DialogDescription>
              </DialogHeader>
              <Card className="w-full h-full bg-transparent border-none">
                <CardContent className="h-full max-h-full flex">
                  <ScrollArea className="w-full">
                    <WorkUploader eventId={eventId} userId={userId} />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={closeDropdown2}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                className="flex items-center w-full"
                onSelect={(e) => e.preventDefault()}
              >
                <FileBadge className="mr-2 h-4 w-4" />
                {t("actions.getCertificate")}
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent
              className={`shadow-light100_dark100 bg-tertiary-light-dark glass wrapper h-full border-none p-2`}
            >
              <DialogHeader className="sr-only">
                <DialogTitle>{t("dialogs.certificate.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialogs.certificate.description")}
                </DialogDescription>
              </DialogHeader>
              <CertificationComponent eventId={eventId} userId={userId} />
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={closeDropdown3}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                className="flex items-center w-full"
                onSelect={(e) => e.preventDefault()}
              >
                <QrCode className="mr-2 h-4 w-4" /> {t("actions.getTicket")}
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className={`glass wrapper h-full border-none p-2`}>
              <DialogHeader className="sr-only">
                <DialogTitle>{t("dialogs.ticket.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialogs.ticket.description")}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="w-full">
                <TiketComponent eventId={eventId} userId={userId} />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
