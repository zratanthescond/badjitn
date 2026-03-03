"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getOrderById } from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

import { useTranslations } from "next-intl";

export default function QRScannerDialog() {
  const t = useTranslations("QRScanner");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (isOpen && !orderData) {
      // Small timeout to ensure the element is in the DOM after Dialog animation
      timeoutId = setTimeout(() => {
        const element = document.getElementById("reader");
        if (element) {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          scanner.render(
            async (decodedText) => {
              setScanResult(decodedText);
              scanner?.clear();
              await handleScanSuccess(decodedText);
            },
            (error) => {
              // Silent error for scanning
            }
          );
        }
      }, 300);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [isOpen, orderData]);

  const handleScanSuccess = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const order = await getOrderById(orderId);
      if (order) {
        setOrderData(order);
      } else {
        setError(t("notFound"));
      }
    } catch (err) {
      setError(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setOrderData(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetScanner();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 glass bg-white/60 dark:bg-slate-800/60 transition-all duration-300">
          <QrCode className="h-4 w-4" />
          <span>{t("scanNext")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("adminScanner")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          {!orderData && !isLoading && !error && (
            <div id="reader" className="w-full border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden" />
          )}

          {isLoading && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground animate-pulse">{t("verifying")}</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center py-8 text-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-xl font-semibold text-destructive mb-2">{t("invalidTicket")}</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={resetScanner} className="bg-primary text-white">
                {t("retry")}
              </Button>
            </div>
          )}

          {orderData && (
            <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{t("accessGranted")}</h3>
                <p className="text-sm text-muted-foreground">{t("scannedAt")} {formatDateTime(new Date()).dateTime}</p>
              </div>

              <div className="glass bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4 border border-white/20">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Event</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{orderData.event?.title || "N/A"}</p>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("participant")}</label>
                    <p className="font-medium">
                      {orderData.buyer ? `${orderData.buyer.firstName} ${orderData.buyer.lastName}` : t("unknown")}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("ticketType")}</label>
                    <div>
                      <Badge variant="secondary" className="glass bg-blue-500/10 text-blue-600 border-blue-200/50">
                        {orderData.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Purchase Date</label>
                  <p className="text-sm">{orderData.createdAt ? formatDateTime(new Date(orderData.createdAt)).dateTime : "N/A"}</p>
                </div>

                {orderData.requiredUserInfo && orderData.requiredUserInfo.length > 0 && (
                   <>
                    <Separator className="bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Additional Info</label>
                      <div className="mt-2 space-y-1">
                        {orderData.requiredUserInfo.map((info: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{info.label}:</span>
                            <span className="font-medium">{info.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                   </>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetScanner} variant="outline" className="flex-1">
                  {t("scanNext")}
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                  {t("close")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
