"use client";

import { FaEllipsisVertical } from "react-icons/fa6";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Flag } from "lucide-react";
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            size={"icon"}
            className="rounded-full z-50 glass absolute top-2 left-2 pointer-events-auto"
          >
            <FaEllipsisVertical />
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
            Report
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
        <AlertDialogContent className="glass flex  flex-col w-full items-start justify-center gap-4 p-4">
          <AlertDialogDescription className="text-white font-bold">
            Report image or title
          </AlertDialogDescription>
          <Separator />
          <RadioGroup onValueChange={(value) => setCause(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sexual content" id="r1" />
              <Label htmlFor="r1">Sexual content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Violent or repulsive content" id="r2" />
              <Label htmlFor="r2">Violent or repulsive content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Hateful or abusive content" id="r3" />
              <Label htmlFor="r3">Hateful or abusive content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Harmful or dangerous acts" id="r4" />
              <Label htmlFor="r3">Harmful or dangerous acts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Spam or misleading" id="r5" />
              <Label htmlFor="r3">Spam or misleading</Label>
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
