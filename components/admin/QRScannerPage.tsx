"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { getOrderById } from "@/lib/actions/order.actions";
import { recordAttendance } from "@/lib/actions/attendance.actions";
import { addScanPoint, removeScanPoint } from "@/lib/actions/event.actions";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/hooks/use-toast";

type QRScannerPageProps = {
  eventId: string;
  eventTitle: string;
  scanPoints: string[];
  userId: string;
};

export default function QRScannerPage({
  eventId,
  eventTitle,
  scanPoints,
  userId,
}: QRScannerPageProps) {
  const MONGO_OBJECT_ID_REGEX = /\b[a-fA-F0-9]{24}\b/;
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableScanPoints, setAvailableScanPoints] = useState<string[]>(scanPoints);
  const [newPoint, setNewPoint] = useState("");
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string>(
    scanPoints.length > 0 ? scanPoints[0] : "Entrée"
  );
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "file">("camera");
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("QRScanner");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { toast } = useToast();

  const handleAddPoint = async () => {
    const trimmedPoint = newPoint.trim();
    if (!trimmedPoint) return;

    if (availableScanPoints.includes(trimmedPoint)) {
      setNewPoint("");
      setIsAddingPoint(false);
      return;
    }

    setIsAdding(true);
    try {
      const updatedEvent = await addScanPoint(eventId, trimmedPoint);
      if (updatedEvent) {
        setAvailableScanPoints(updatedEvent.scanPoints);
        setSelectedPoint(trimmedPoint);
        setNewPoint("");
        setIsAddingPoint(false);
        toast({
          title: "Succès",
          description: "Point de scannage ajouté avec succès.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Failed to add scan point", err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le point de scannage.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePoint = async () => {
    if (!selectedPoint || selectedPoint === "Entrée") return;

    if (!confirm(t('confirmDelete'))) return;

    setIsDeleting(true);
    try {
      const updatedEvent = await removeScanPoint(eventId, selectedPoint);
      if (updatedEvent) {
        setAvailableScanPoints(updatedEvent.scanPoints);
        setSelectedPoint(updatedEvent.scanPoints.length > 0 ? updatedEvent.scanPoints[0] : "Entrée");
        toast({
          title: "Succès",
          description: t('pointDeleted'),
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Failed to remove scan point", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le point de scannage.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const initializeScanner = (elementId: string) => {
    if (scannerRef.current) {
        return scannerRef.current;
    }
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    scannerRef.current = new Html5Qrcode(elementId);
    return scannerRef.current;
  };

  const startScanner = async (cameraId: string) => {
    setIsCameraStarting(true);
    try {
      // Clear any existing scanner to avoid state transition conflicts
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch {
          // Ignore cleanup errors from stale instances
        }
        scannerRef.current = null;
      }

      // Wait for the #reader element to be in the DOM
      const readerEl = document.getElementById("reader");
      if (!readerEl) {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (!document.getElementById("reader")) {
          throw new Error("Scanner element not found");
        }
      }

      scannerRef.current = new Html5Qrcode("reader");

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          await stopScanner();
          await handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Continuous scan - ignore non-match errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner", err);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la caméra.",
        variant: "destructive",
      });
    } finally {
      setIsCameraStarting(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleRequestPermission = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices.map(d => ({ id: d.id, label: d.label })));
        setSelectedCameraId(devices[0].id);
        setHasPermission(true);
        // We need to wait for the DOM to update to include the "reader" element
        setTimeout(() => startScanner(devices[0].id), 100);
      } else {
        setHasPermission(false);
      }
    } catch (err) {
      setHasPermission(false);
      console.error("Permission denied", err);
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      if (scannerRef.current?.isScanning) {
        await stopScanner();
      }

      // Read the image file and decode with jsQR (canvas-based, more robust)
      const decodedText = await decodeQRFromFile(file);
      if (decodedText) {
        console.log("[QR File Scan] Decoded:", decodedText);
        await handleScanSuccess(decodedText);
      } else {
        console.warn("[QR File Scan] No QR code found in image");
        setError(t("notFound"));
      }
    } catch (err: any) {
      console.error("[QR File Scan] Error:", err);
      setError(t("notFound"));
    } finally {
      if (e.target) {
        e.target.value = "";
      }
      setIsLoading(false);
    }
  };

  /**
   * Decode QR from an image file using canvas + jsQR.
   * Tries multiple scales to handle small/large QR codes.
   */
  const decodeQRFromFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Try at original size first, then scaled versions
          const scales = [1, 2, 0.5, 3];
          for (const scale of scales) {
            const canvas = document.createElement("canvas");
            const w = Math.round(img.naturalWidth * scale);
            const h = Math.round(img.naturalHeight * scale);
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            ctx.drawImage(img, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
            if (code?.data) {
              resolve(code.data);
              return;
            }
          }
          resolve(null);
        };
        img.onerror = () => resolve(null);
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const extractCandidateOrderIds = (rawValue: string) => {
    const value = (rawValue || "").trim();
    if (!value) return [];
    const candidates: string[] = [];
    const seen = new Set<string>();
    const addCandidate = (candidate?: string | null) => {
      if (!candidate) return;
      const normalized = candidate.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      candidates.push(candidate);
    };

    // Direct ObjectId payload
    const directMatch = value.match(MONGO_OBJECT_ID_REGEX);
    if (directMatch) {
      addCandidate(directMatch[0]);
    }

    // Common formats and URL/query payloads
    const decoded = (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })();

    const prefixedMatch = decoded.match(/RC-([a-fA-F0-9]{24})/i);
    addCandidate(prefixedMatch?.[1]);

    // Query params priority: orderId/ticketId/id
    try {
      const url = new URL(decoded);
      const qpOrderId = url.searchParams.get("orderId");
      const qpTicketId = url.searchParams.get("ticketId");
      const qpId = url.searchParams.get("id");
      addCandidate(qpOrderId?.match(MONGO_OBJECT_ID_REGEX)?.[0]);
      addCandidate(qpTicketId?.match(MONGO_OBJECT_ID_REGEX)?.[0]);
      addCandidate(qpId?.match(MONGO_OBJECT_ID_REGEX)?.[0]);
    } catch {
      // Ignore non-URL payloads
    }

    // JSON payload support: {"orderId":"..."} or similar
    if (decoded.startsWith("{") && decoded.endsWith("}")) {
      try {
        const parsed = JSON.parse(decoded);
        const candidates = [
          parsed?.orderId,
          parsed?._id,
          parsed?.id,
          parsed?.ticketId,
        ].filter(Boolean);
        for (const candidate of candidates) {
          const match = String(candidate).match(MONGO_OBJECT_ID_REGEX);
          if (match) addCandidate(match[0]);
        }
      } catch {
        // Ignore invalid JSON payloads
      }
    }

    // Pipe-separated payloads: "orderId|name|email" (badge designer format)
    if (decoded.includes("|")) {
      const segments = decoded.split("|");
      for (const segment of segments) {
        const match = segment.trim().match(MONGO_OBJECT_ID_REGEX);
        if (match) addCandidate(match[0]);
      }
    }

    // Keep all ObjectIds found in the payload, prioritize the last one.
    const allMatches = decoded.match(new RegExp(MONGO_OBJECT_ID_REGEX.source, "g")) || [];
    [...allMatches].reverse().forEach((id) => addCandidate(id));

    return candidates;
  };

  useEffect(() => {
    // Check for cameras if permission might have been granted previously
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
            setCameras(devices.map(d => ({ id: d.id, label: d.label })));
            setSelectedCameraId(devices[0].id);
            setHasPermission(true);
            setTimeout(() => startScanner(devices[0].id), 200);
        }
    }).catch(() => {
        // Permission not yet granted
    });

    return () => {
      stopScanner().then(() => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
      });
    };
  }, []);

  const handleScanSuccess = async (rawScanValue: string) => {
    setIsLoading(true);
    setError(null);
    console.log("[QR Scan] Raw value:", rawScanValue);
    try {
      const candidateOrderIds = extractCandidateOrderIds(rawScanValue);
      console.log("[QR Scan] Candidate order IDs:", candidateOrderIds);
      if (candidateOrderIds.length === 0) {
        setError(t("notFound"));
        return;
      }

      let foundOrderForAnotherEvent = false;
      for (const orderId of candidateOrderIds) {
        const order = await getOrderById(orderId);
        if (!order) continue;

        if (order.event?._id !== eventId) {
          foundOrderForAnotherEvent = true;
          continue;
        }

        await recordAttendance({
          orderId,
          eventId,
          scanPoint: selectedPoint,
          userId,
          path: `/events/${eventId}/scan`,
        });

        setOrderData(order);
        return;
      }

      if (foundOrderForAnotherEvent) {
        setError(t('notBelong'));
      } else {
        setError(t('notFound'));
      }
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setOrderData(null);
    setError(null);
    if (scanMode === "camera" && selectedCameraId) {
        // Defer scanner start to allow React to re-render the #reader div
        setTimeout(() => startScanner(selectedCameraId), 300);
    }
  };

  return (
    <div 
      className={`max-w-4xl mx-auto p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button variant="ghost" asChild className={`gap-2 hover:bg-white/10 transition-colors backdrop-blur-sm ${isRTL ? "flex-row-reverse" : ""}`}>
          <Link href={`/orders/?eventId=${eventId}`}>
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span className="font-semibold tracking-tight">{t('back')}</span>
          </Link>
        </Button>
        <Badge variant="outline" className={`glass bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 px-5 py-2 uppercase tracking-[0.2em] font-black text-[10px] shadow-sm ${isRTL ? "font-arabic" : ""}`}>
          {t('adminScanner')}
        </Badge>
      </div>

      <div className="text-center space-y-4">
        <h1 className={`text-4xl md:text-6xl font-black tracking-tighter leading-none ${isRTL ? "font-arabic" : ""}`}>
           <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {eventTitle}
           </span>
        </h1>
        <p className={`text-slate-500 dark:text-slate-400 font-medium tracking-tight text-lg md:text-xl max-w-2xl mx-auto opacity-80 ${isRTL ? "font-arabic" : ""}`}>
          {t('subtitle')}
        </p>
      </div>

      <div className="glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-6 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity" />
        
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch ${isRTL ? "text-right" : "text-left"}`}>
          <div className="lg:col-span-2 space-y-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className={`flex justify-between items-end ${isRTL ? "flex-row-reverse" : ""}`}>
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPin className="h-4 w-4 text-blue-500" />
                  {t('currentPoint')}
                </label>
                {!isAddingPoint && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-3 text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                    onClick={() => setIsAddingPoint(true)}
                  >
                    + {t('newPoint')}
                  </Button>
                )}
              </div>
              
              {isAddingPoint ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-400">
                  <Input
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    placeholder={t('pointName')}
                    className={`h-14 glass bg-white/60 dark:bg-slate-800/60 border-blue-200/50 dark:border-blue-900/30 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-base font-semibold ${isRTL ? "text-right" : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPoint();
                      }
                    }}
                    autoFocus
                  />
                  <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Button 
                      onClick={handleAddPoint} 
                      disabled={isAdding}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25"
                    >
                      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : t('ok')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingPoint(false)} className="h-12 border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:ring-2 focus:ring-slate-500/20">
                       {t('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Select
                        value={selectedPoint}
                        onValueChange={setSelectedPoint}
                        >
                            <SelectTrigger className={`w-full h-14 glass bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-800/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-base font-bold transition-all hover:border-blue-300 dark:hover:border-blue-800 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <SelectValue placeholder={t('choosePoint')} />
                            </SelectTrigger>
                            <SelectContent className="glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 rounded-[1.5rem] p-1 shadow-2xl">
                                {availableScanPoints.length > 0 ? (
                                availableScanPoints.map((point) => (
                                    <SelectItem key={point} value={point} className={`rounded-xl py-3 font-semibold focus:bg-blue-500 focus:text-white transition-colors ${isRTL ? "text-right flex-row-reverse" : ""}`}>
                                    {point}
                                    </SelectItem>
                                ))
                                ) : (
                                <SelectItem value="Entrée" className={`rounded-xl py-3 font-semibold ${isRTL ? "text-right" : ""}`}>Entrée</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedPoint !== "Entrée" && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-14 w-14 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100/50 dark:border-red-900/20 flex-shrink-0"
                            onClick={handleRemovePoint}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                        </Button>
                    )}
                </div>
              )}
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/50 dark:border-blue-900/20 relative overflow-hidden">
                <div className={`absolute top-0 ${isRTL ? "left-0" : "right-0"} p-4 opacity-10`}>
                    <QrCode className="h-24 w-24 text-blue-600" />
                </div>
                <h3 className={`font-black uppercase tracking-[0.2em] text-[10px] text-blue-700/60 dark:text-blue-400/60 mb-4 ${isRTL ? "font-arabic" : ""}`}>{t('instructions.title')}</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-4 font-bold leading-relaxed">
                    <li className={`flex gap-3 items-start ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">1</span>
                        <span className={isRTL ? "font-arabic" : ""}>{t('instructions.step1')}</span>
                    </li>
                    <li className={`flex gap-3 items-start ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">2</span>
                        <span className={isRTL ? "font-arabic" : ""}>{t('instructions.step2')}</span>
                    </li>
                    <li className={`flex gap-3 items-start ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">3</span>
                        <span className={isRTL ? "font-arabic" : ""}>{t('instructions.step3')}</span>
                    </li>
                </ul>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[450px] bg-slate-100/30 dark:bg-slate-950/20 border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden transition-all group-hover:border-blue-400/30 relative">
            
            {!orderData && !isLoading && !error && (
                <>
                    {hasPermission === null && (
                        <div className="flex flex-col items-center text-center p-12 space-y-6 animate-in zoom-in duration-500">
                             <div className="relative mb-2">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                                <Camera className="h-20 w-20 text-blue-500 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{t('requestPermissions')}</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={handleRequestPermission} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 h-14 cursor-pointer">
                                    {t('scanCameraDirectly')}
                                </Button>
                                <Button variant="outline" onClick={() => setScanMode(scanMode === 'camera' ? 'file' : 'camera')} className="rounded-xl border-slate-200 dark:border-slate-800 h-14 px-8 font-bold">
                                    {scanMode === 'camera' ? t('scanImageFile') : t('scanCameraDirectly')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {hasPermission === true && scanMode === 'camera' && (
                        <div className="w-full h-full min-h-[400px] flex flex-col">
                            <div id="reader" className="w-full flex-grow overflow-hidden" />
                            <div className="p-4 bg-white/10 dark:bg-black/20 backdrop-blur-md flex justify-between items-center">
                                <div className="flex gap-2">
                                    {cameras.length > 1 && (
                                        <Select value={selectedCameraId} onValueChange={(val) => {
                                            stopScanner().then(() => {
                                                setSelectedCameraId(val);
                                                startScanner(val);
                                            });
                                        }}>
                                            <SelectTrigger className="w-[180px] h-10 border-white/20 glass rounded-lg text-xs font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="glass">
                                                {cameras.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setScanMode('file')} className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        {t('scanImageFile')}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={stopScanner} className="text-[10px] font-black uppercase tracking-wider text-red-400">
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        {t('stopScanning')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {scanMode === 'file' && (
                        <div className="flex flex-col items-center text-center p-12 space-y-8 animate-in zoom-in duration-500 w-full max-w-md">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-4 border-dashed border-blue-500/30 rounded-[2rem] p-12 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer group"
                            >
                                <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black mb-2">{t('chooseImage')}</h3>
                                <p className="text-sm text-slate-500 font-bold">{t('orDropImage')}</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileScan}
                                />
                            </div>
                            <Button variant="ghost" onClick={() => setScanMode('camera')} className="text-sm font-bold opacity-60 hover:opacity-100">
                                {t('scanCameraDirectly')}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {isLoading && (
              <div className="flex flex-col items-center text-center p-10 animate-in zoom-in duration-300">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
                    <Loader2 className="h-24 w-24 text-blue-600 dark:text-blue-400 animate-spin relative z-10" />
                </div>
                <h3 className={`text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2 ${isRTL ? "font-arabic" : ""}`}>{t('verifying')}</h3>
                <p className={`text-lg text-slate-500 dark:text-slate-400 font-medium opacity-70 tracking-tight ${isRTL ? "font-arabic" : ""}`}>{t('pleaseWait')}</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center p-12 text-center animate-in zoom-in-95 duration-500">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse rounded-full" />
                  <div className="h-32 w-32 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center relative z-10 border border-red-200/50 dark:border-red-900/30">
                    <XCircle className="h-16 w-16 text-red-500" />
                  </div>
                </div>
                <h3 className={`text-4xl font-black tracking-tighter text-red-600 dark:text-red-400 mb-4 ${isRTL ? "font-arabic" : ""}`}>{t('invalidTicket')}</h3>
                <p className={`text-slate-600 dark:text-slate-400 mb-10 text-xl font-bold tracking-tight max-w-sm ${isRTL ? "font-arabic" : ""}`}>{error}</p>
                <Button onClick={resetScanner} size="lg" className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-[1.25rem] px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/25 transition-transform active:scale-95">
                  {t('retry')}
                </Button>
              </div>
            )}

            {orderData && (
              <div className="w-full p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse rounded-full" />
                    <div className="h-32 w-32 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center relative z-10 border border-green-200/50 dark:border-green-900/30 shadow-2xl">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                  </div>
                  <h3 className={`text-5xl font-black tracking-tighter text-green-600 dark:text-green-400 mb-2 ${isRTL ? "font-arabic" : ""}`}>{t('accessGranted')}</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span className={`text-xs text-green-700 dark:text-green-300 font-black uppercase tracking-widest ${isRTL ? "font-arabic" : ""}`}>
                        {t('registeredAt')} {selectedPoint}
                    </span>
                  </div>
                </div>

                <div className="glass bg-white/40 dark:bg-slate-800/40 rounded-[2rem] p-8 space-y-8 border border-white/20 dark:border-white/5 shadow-inner">
                  <div className={`grid grid-cols-2 gap-10 ${isRTL ? "text-right" : ""}`}>
                    <div className="space-y-1">
                      <label className={`text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ${isRTL ? "font-arabic" : ""}`}>{t('participant')}</label>
                      <p className={`text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none ${isRTL ? "font-arabic" : ""}`}>
                        {orderData.buyer ? `${orderData.buyer.firstName} ${orderData.buyer.lastName}` : t('unknown')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ${isRTL ? "font-arabic" : ""}`}>{t('ticketType')}</label>
                      <div>
                        <Badge className={`bg-blue-600 hover:bg-blue-600 text-white border-transparent py-1.5 px-4 font-black rounded-full text-[10px] uppercase tracking-wider ${isRTL ? "font-arabic" : ""}`}>
                          {orderData.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-200 dark:bg-slate-700/30" />
                  
                  <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className={`text-[11px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? "font-arabic" : ""}`}>{t('scannedAt')}</span>
                    <span className={`font-black text-sm text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg ${isRTL ? "font-arabic" : ""}`}>
                        {formatDateTime(new Date()).dateTime}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={resetScanner} size="lg" className={`w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-500/30 transition-all duration-300 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs active:scale-[0.98] ${isRTL ? "font-arabic" : ""}`}>
                    {t('scanNext')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Hidden container for file scanning — must NOT use display:none or the hidden class, otherwise Html5Qrcode can't render into it */}
      <div id="reader-hidden" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true" />
    </div>
  );
}
