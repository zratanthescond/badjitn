"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { submitBankTransfer } from "@/lib/actions/payment";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, X, Landmark } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
interface BankTransferModalProps {
  eventId: string;
  buyerId: string;
  amount: number;
  currency: string;
  details: any[];
  requiredUserInfo?: any[];
  discountInfo?: any;
  discountProofUrl?: string;
  originalAmount?: number;
  validateBeforeOpen?: () => Promise<boolean> | boolean;
  beforeSubmit?: () => Promise<boolean> | boolean;
}

export function BankTransferModal({
  eventId,
  buyerId,
  amount,
  currency,
  details,
  requiredUserInfo,
  discountInfo,
  discountProofUrl,
  originalAmount,
  validateBeforeOpen,
  beforeSubmit,
}: BankTransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [transferId, setTransferId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("bankTransferModal");
  const text = (key: string, fallback: string) =>
    t.has(key) ? t(key as any) : fallback;

  const handleOpen = async () => {
    if (validateBeforeOpen && !(await validateBeforeOpen())) {
      toast({
        title: text("error", "Erreur"),
        description: text(
          "completeRegistrationFirst",
          "Veuillez d'abord completer les informations d'inscription."
        ),
        variant: "destructive",
      });
      return;
    }

    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: text("invalidFileType", "Type de fichier invalide"),
          description: text("invalidFileTypeDescription", "Veuillez televerser une image (JPG, PNG, etc.)"),
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: text("fileTooLarge", "Fichier trop volumineux"),
          description: text("fileTooLargeDescription", "Veuillez televerser un fichier inferieur a 5 Mo"),
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTransferId = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferId.trim()) {
      toast({
        title: text("error", "Erreur"),
        description: text("enterTransferId", "Veuillez saisir un identifiant de virement"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (beforeSubmit) {
        const canContinue = await beforeSubmit();
        if (!canContinue) return;
      }

      const result = await submitBankTransfer({
        eventId,
        buyerId,
        totalAmount: amount.toString(),
        details,
        ...(requiredUserInfo && requiredUserInfo.length > 0 ? { requiredUserInfo } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 ? { discountInfo } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 && discountProofUrl ? { discountProofUrl } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 && originalAmount !== undefined ? { originalAmount } : {}),
        transferId: transferId.trim(),
        screenshotBase64: null,
      });

      if (result.success) {
        toast({
          title: text("success", "Succes"),
          description: text(
            "transferSubmitted",
            "Le virement bancaire a ete envoye avec succes. Verification en attente."
          ),
        });
        setTransferId("");
        setIsOpen(false);
        router.push(`/events/${eventId}?registered=1`);
      } else {
        toast({
          title: text("error", "Erreur"),
          description: result.message || text("submitTransferFailed", "Echec de l'envoi du virement"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: text("error", "Erreur"),
        description: text("submitTransferError", "Une erreur est survenue lors de l'envoi du virement"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      toast({
        title: text("error", "Erreur"),
        description: text("uploadScreenshot", "Veuillez televerser une capture d'ecran"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (beforeSubmit) {
        const canContinue = await beforeSubmit();
        if (!canContinue) return;
      }

      // Step 1: Upload the file to the native upload API
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadRes = await fetch("/api/upload/", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success || !uploadData.url) {
        throw new Error(uploadData.message || "Failed to upload screenshot");
      }

      const screenshotUrl = uploadData.url;

      // Step 2: Submit the bank transfer with the screenshot URL
      const result = await submitBankTransfer({
        eventId,
        buyerId,
        totalAmount: amount.toString(),
        details,
        ...(requiredUserInfo && requiredUserInfo.length > 0 ? { requiredUserInfo } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 ? { discountInfo } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 && discountProofUrl ? { discountProofUrl } : {}),
        ...(discountInfo && Number(discountInfo.value) > 0 && originalAmount !== undefined ? { originalAmount } : {}),
        transferId: null,
        screenshotUrl,
        screenshotBase64: null,
      });

      if (result.success) {
        toast({
          title: text("success", "Succes"),
          description: text(
            "screenshotSubmitted",
            "La capture du virement a ete envoyee avec succes. Verification en attente."
          ),
        });
        setUploadedFile(null);
        setPreview(null);
        setIsOpen(false);
        router.push(`/events/${eventId}?registered=1`);
      } else {
        toast({
          title: text("error", "Erreur"),
          description: result.message || text("submitScreenshotFailed", "Echec de l'envoi de la capture"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: text("error", "Erreur"),
        description: text("uploadScreenshotError", "Une erreur est survenue lors du televersement de la capture"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTransferId("");
    setUploadedFile(null);
    setPreview(null);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={handleOpen}
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 transition-all duration-300"
        >
          <Landmark className="mr-2 h-5 w-5" />
          {text("cta", "Virement bancaire")} {amount} {currency}
        </Button>
      </motion.div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-pink-500" />
                <h2 className="text-xl font-bold">
                  {text("title", "Paiement par virement bancaire")}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <Alert className="mb-6 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {text(
                    "description",
                    "Effectuez un virement bancaire vers notre compte puis fournissez l'identifiant du virement ou une capture de confirmation."
                  )}
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="transfer-id" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="transfer-id" className="text-sm">
                    {text("transferIdTab", "Identifiant")}
                  </TabsTrigger>
                  <TabsTrigger value="screenshot" className="text-sm">
                    {text("screenshotTab", "Capture")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transfer-id" className="mt-0">
                  <form onSubmit={handleSubmitTransferId} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="transfer-id"
                        className="text-sm font-medium"
                      >
                        {text("transferIdLabel", "Identifiant du virement")}
                      </Label>
                      <Input
                        id="transfer-id"
                        placeholder={text("transferIdPlaceholder", "ex. TRF12345678910")}
                        value={transferId}
                        onChange={(e) => setTransferId(e.target.value)}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {text(
                        "transferIdHelp",
                        "Saisissez la reference ou le numero de confirmation de votre virement bancaire."
                      )}
                    </p>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2"
                    >
                      {isLoading ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          {text("submitting", "Envoi...")}
                        </>
                      ) : (
                        text("submitTransferId", "Envoyer l'identifiant")
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="screenshot" className="mt-0">
                  <form onSubmit={handleSubmitScreenshot} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="screenshot"
                        className="text-sm font-medium"
                      >
                        {text("uploadScreenshotLabel", "Televerser la capture")}
                      </Label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
                        <label
                          htmlFor="file-upload"
                          className="flex w-full cursor-pointer flex-col items-center justify-center"
                        >
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <p className="mt-1 text-xs font-medium text-foreground">
                            {text("uploadHint", "Cliquez pour televerser ou glissez-deposez")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {text("uploadFormats", "PNG, JPG, GIF jusqu'a 5 Mo")}
                          </p>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                          />
                        </label>
                      </div>

                      {preview && (
                        <ScrollArea className="h-36 w-full rounded-lg border">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">
                              Preview:
                            </p>

                            <img
                              src={preview || "/placeholder.svg"}
                              alt="Screenshot preview"
                              className="h-32 w-full rounded-lg object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                setPreview(null);
                              }}
                              disabled={isLoading}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Remove image
                            </button>
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !uploadedFile}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2"
                    >
                          {isLoading ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              {text("uploading", "Televersement...")}
                            </>
                          ) : (
                            text("submitScreenshot", "Envoyer la capture")
                          )}
                        </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
