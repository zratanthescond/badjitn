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
interface BankTransferModalProps {
  orderId: string;
  amount: number;
  currency: string;
}

export function BankTransferModal({
  orderId,
  amount,
  currency,
}: BankTransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [transferId, setTransferId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
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
        title: "Error",
        description: "Please enter a transfer ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await submitBankTransfer({
        orderId,
        transferId: transferId.trim(),
        screenshot: null,
      });

      if (result.success) {
        toast({
          title: "Success",
          description:
            "Bank transfer submitted successfully. Awaiting verification.",
        });
        setTransferId("");
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit transfer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while submitting your transfer",
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
        title: "Error",
        description: "Please upload a screenshot",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const result = await submitBankTransfer({
        orderId,
        transferId: null,
        screenshot: formData,
      });

      if (result.success) {
        toast({
          title: "Success",
          description:
            "Bank transfer screenshot submitted successfully. Awaiting verification.",
        });
        setUploadedFile(null);
        setPreview(null);
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit screenshot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading your screenshot",
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
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full py-7 font-medium shadow-lg shadow-pink-200/50 transition-all duration-300"
        >
          <Landmark className="mr-2 h-5 w-5" />
          Virement Bancaire {amount} {currency}
        </Button>
      </motion.div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-pink-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Bank Transfer Payment
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  Make a bank transfer to our account and provide your transfer
                  ID or a screenshot of the confirmation.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="transfer-id" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="transfer-id" className="text-sm">
                    Transfer ID
                  </TabsTrigger>
                  <TabsTrigger value="screenshot" className="text-sm">
                    Screenshot
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transfer-id" className="mt-0">
                  <form onSubmit={handleSubmitTransferId} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="transfer-id"
                        className="text-sm font-medium"
                      >
                        Transfer ID
                      </Label>
                      <Input
                        id="transfer-id"
                        placeholder="e.g., TRF12345678910"
                        value={transferId}
                        onChange={(e) => setTransferId(e.target.value)}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the reference or confirmation number from your bank
                      transfer.
                    </p>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2"
                    >
                      {isLoading ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Transfer ID"
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
                        Upload Screenshot
                      </Label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-gray-400 hover:bg-gray-50">
                        <label
                          htmlFor="file-upload"
                          className="flex w-full cursor-pointer flex-col items-center justify-center"
                        >
                          <Upload className="h-6 w-6 text-gray-400" />
                          <p className="mt-1 text-xs font-medium text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
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
                            <p className="text-xs font-medium text-gray-700">
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
                          Uploading...
                        </>
                      ) : (
                        "Submit Screenshot"
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
