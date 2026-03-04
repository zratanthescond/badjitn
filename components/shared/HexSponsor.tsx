"use client";
import { useEffect, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/components/ui/card";
import type { IUserSponsor } from "@/lib/database/models/userSponser.model";
import { deleteSponsor, getSponsors } from "@/lib/actions/sponsor.action";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { RefreshCcw, User, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { borderColors } from "@/constants";

export default function HexGridSponsor({ userId }: { userId: string }) {
  const t = useTranslations("HexGridSponsor");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [mySponsor, setMySponsor] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<IUserSponsor[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchSponsors = () =>
    startTransition(async () => {
      const res = await getSponsors(null, null);
      if (res?.success) {
        setSponsors(res.data);
      }
    });

  useEffect(() => {
    fetchSponsors();
  }, [mySponsor]);

  const handleDelete = ({
    userId,
    sponsorId,
  }: {
    userId: string;
    sponsorId: string;
  }) =>
    startTransition(async () => {
      const res = await deleteSponsor({ userId, sponsorId });
      if (res.success) {
        fetchSponsors();
        toast({
          title: t("messages.deleteSuccess"),
          description: t("messages.deleteSuccessDescription"),
        });
      }
    });

  return (
    <div
      className="flex justify-center items-center flex-col p-2"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2 justify-end self-end">
        <Button
          onClick={() => {
            setMySponsor(userId.toString());
          }}
          size={"sm"}
          variant={"outline"}
        >
          <User />
          {t("actions.mySponsors")}
        </Button>
        <Button
          onClick={() => {
            setMySponsor(null);
          }}
          size={"sm"}
          variant={"outline"}
        >
          <User />
          {t("actions.allSponsors")}
        </Button>
        <Button onClick={fetchSponsors} size={"icon"} variant={"outline"}>
          <RefreshCcw />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 hex-grid">
        {isPending && (
          <>
            <Skeleton className="hexagon" />
            <Skeleton className="hexagon" />
            <Skeleton className="hexagon" />
            <Skeleton className="hexagon" />
          </>
        )}
        {sponsors &&
          !isPending &&
          sponsors.map((card, index) => (
            <div
              key={index}
              className="hexagon-border"
              style={{
                "--border-color": borderColors[index % borderColors.length],
              }}
            >
              {card.creator.toString() == userId && (
                <Button
                  onClick={() =>
                    handleDelete({
                      userId: userId.toString(),
                      sponsorId: card._id.toString(),
                    })
                  }
                  variant={"ghost"}
                  size={"icon"}
                  className="absolute top-0 z-10 rounded-full"
                >
                  <X />
                </Button>
              )}

              <a href={card.website} target="_blank" rel="noopener noreferrer">
                <Card
                  className="hexagon"
                  style={{
                    backgroundImage: `url(${card.logo})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                ></Card>
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
