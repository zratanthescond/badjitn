"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addManualParticipant } from "@/lib/actions/order.actions";
import { Loader2, UserPlus } from "lucide-react";
import { useLocale } from "next-intl";

interface AddParticipantDialogProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  isFreeEvent?: boolean;
}

export default function AddParticipantDialog({
  eventId,
  isOpen,
  onClose,
  isFreeEvent,
}: AddParticipantDialogProps) {
  const t = useTranslations("orderAdministration");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    planName: "Manuel",
    planPrice: "0",
    ticketType: isFreeEvent ? "hosted" : "paid",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await addManualParticipant({
        eventId,
        ...formData,
      });

      toast({
        title: "Succès",
        description: "Participant ajouté avec succès.",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        planName: "Manuel",
        planPrice: "0",
        ticketType: isFreeEvent ? "hosted" : "paid",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du participant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[500px] ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <UserPlus className="h-5 w-5 text-blue-500" />
            <span className={isRTL ? "font-arabic" : ""}>Ajouter un participant</span>
          </DialogTitle>
          <DialogDescription className={isRTL ? "font-arabic" : ""}>
            Ajoutez manuellement un participant à cet événement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={isRTL ? "font-arabic" : ""}>Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ex: Jean"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={isRTL ? "font-arabic text-right" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className={isRTL ? "font-arabic" : ""}>Nom *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Ex: Dupont"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={isRTL ? "font-arabic text-right" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={isRTL ? "font-arabic" : ""}>Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ex: jean.dupont@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={isRTL ? "text-right" : ""}
            />
          </div>

          {!isFreeEvent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketType" className={isRTL ? "font-arabic" : ""}>Type de billet</Label>
                <Select
                  value={formData.ticketType}
                  onValueChange={(value) => handleSelectChange("ticketType", value)}
                >
                  <SelectTrigger className={isRTL ? "flex-row-reverse font-arabic" : ""}>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid" className={isRTL ? "font-arabic" : ""}>Payant</SelectItem>
                    <SelectItem value="hosted" className={isRTL ? "font-arabic" : ""}>Gratuit / Invité (Hosted)</SelectItem>
                    <SelectItem value="doorpay" className={isRTL ? "font-arabic" : ""}>Paiement sur place</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planPrice" className={isRTL ? "font-arabic" : ""}>Montant</Label>
                <Input
                  id="planPrice"
                  name="planPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.planPrice}
                  onChange={handleChange}
                  className={isRTL ? "text-right" : ""}
                  disabled={formData.ticketType === "free" || formData.ticketType === "hosted"}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="planName" className={isRTL ? "font-arabic" : ""}>Nom du Plan/Option (Optionnel)</Label>
            <Input
              id="planName"
              name="planName"
              placeholder="Ex: VIP, Standard..."
              value={formData.planName}
              onChange={handleChange}
              className={isRTL ? "font-arabic text-right" : ""}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className={isRTL ? "font-arabic" : ""}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white ${isRTL ? "font-arabic" : ""}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
