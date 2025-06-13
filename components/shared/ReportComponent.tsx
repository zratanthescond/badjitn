"use client";

import { FaEllipsisVertical } from "react-icons/fa6";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Flag, MoreVertical } from "lucide-react";
import { MouseEvent, useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useReport } from "@/hooks/useReport";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
export default function ReportComponent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  const [cause, setCause] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const { isPending, mutate, isSuccess } = useReport(eventId, userId, cause);
  const t = useTranslations("report");
  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      setCause("");
      toast({
        title: "Reported",
        description: "Your report has been sent successfully",
      });
    }
  }, [isSuccess]);
  const reportCauses = [
    "Sexual content",
    "Violent or repulsive content",
    "Hateful or abusive content",
    "Harmful or dangerous acts",
    "Spam or misleading",
  ];
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            variant={"ghost"}
            size={"icon"}
            className="h-8 w-8 bg-black/20 hover:bg-black/40 rounded-full absolute top-2 left-2 z-10 shadow-md transition-all hover:shadow-lg"
          >
            <MoreVertical className="h-4 w-4 text-white" fill="#fff" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex flex-row"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Flag />
            <span className="ml-2">{t("report")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={open}
        onOpenChange={() => {
          alert("closed");
          setTimeout(() => {
            document.body.style.pointerEvents = "";
          }, 100);
        }}
      >
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
          className="glass flex  flex-col w-full items-start justify-center gap-4 p-4"
        >
          <AlertDialogDescription className="text-white font-bold">
            {t("title")}
          </AlertDialogDescription>
          <Separator />
          <RadioGroup onValueChange={(value) => setCause(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sexual content" id="r1" />
              <Label htmlFor="r1">{t("SexualContent")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Violent or repulsive content" id="r2" />
              <Label htmlFor="r2">{t("ViolentOrRepulsiveContent")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Hateful or abusive content" id="r3" />
              <Label htmlFor="r3">{t("HatefulOrAbusiveContent")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sarmful or dangerous acts" id="r4" />
              <Label htmlFor="r3">{t("HarmfulOrDangerousActs")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Spam or misleading" id="r5" />
              <Label htmlFor="r3">{t("SpamOrMisleading")}</Label>
            </div>
          </RadioGroup>
          <div className="flex w-full flex-row items-center justify-end space-x-2 ">
            <Button
              variant={"ghost"}
              onClick={() => {
                setOpen(false);
                setCause("");
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={cause.length === 0}
              variant={"ghost"}
              onClick={() => {
                console.log(cause);
                setOpen(false);
                mutate();
              }}
            >
              Report
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
