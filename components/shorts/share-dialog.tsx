"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useTranslations } from "next-intl";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function ShareDialog({ isOpen, onClose, videoId }: ShareDialogProps) {
  const shareUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${videoId}`;
  const t = useTranslations("shorts");
  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareText = encodeURIComponent("Check out this amazing event!");

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`,
      whatsapp: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <div className="glass flex flex-col w-full p-6 gap-4 rounded-lg backdrop-blur-md bg-white/10 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">
            {t("share.title")}
          </h3>

          <Input
            type="url"
            value={shareUrl}
            readOnly
            className="bg-white/10 border-white/20 text-white placeholder-white/70"
            onClick={(e) => e.currentTarget.select()}
          />

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="glass rounded-lg text-white bg-blue-600/80 hover:bg-blue-600"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="mr-2 h-4 w-4" />
              {t("share.facebook")}
            </Button>

            <Button
              className="glass rounded-lg text-white bg-black/80 hover:bg-black"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="mr-2 h-4 w-4" />
              {t("share.twitter")}
            </Button>

            <Button
              className="glass rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => handleShare("instagram")}
            >
              <Instagram className="mr-2 h-4 w-4" />
              {t("share.instagram")}
            </Button>

            <Button
              className="glass rounded-lg text-white bg-green-600/80 hover:bg-green-600"
              onClick={() => handleShare("whatsapp")}
            >
              <FaWhatsapp className="mr-2 h-4 w-4" />
              {t("share.whatsapp")}
            </Button>
          </div>

          <div className="flex flex-row items-center justify-end gap-3 mt-4">
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              {t("share.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-white/20 text-white hover:bg-white/30"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              {t("share.copyLink")}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
