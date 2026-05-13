"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  ArrowRight,
  Loader2,
  Users,
  SkipForward,
} from "lucide-react";
import {
  bulkImportParticipants,
  type ImportedParticipantRow,
} from "@/lib/actions/order.actions";
import { useQueryClient } from "@tanstack/react-query";

// Well-known field keys for auto-mapping
const KNOWN_FIELDS: Record<string, { field: string; label: string }> = {
  // French
  prénom: { field: "firstname", label: "Prénom" },
  prenom: { field: "firstname", label: "Prénom" },
  nom: { field: "lastname", label: "Nom" },
  "nom de famille": { field: "lastname", label: "Nom" },
  email: { field: "email", label: "Email" },
  "e-mail": { field: "email", label: "Email" },
  courriel: { field: "email", label: "Email" },
  téléphone: { field: "phone", label: "Téléphone" },
  telephone: { field: "phone", label: "Téléphone" },
  "numéro de téléphone": { field: "phone", label: "Téléphone" },
  "numero de telephone": { field: "phone", label: "Téléphone" },
  tel: { field: "phone", label: "Téléphone" },
  mobile: { field: "phone", label: "Téléphone" },
  ville: { field: "city", label: "Ville" },
  city: { field: "city", label: "Ville" },
  gouvernorat: { field: "city", label: "Gouvernorat" },
  pays: { field: "country", label: "Pays" },
  country: { field: "country", label: "Pays" },
  société: { field: "company", label: "Société" },
  societe: { field: "company", label: "Société" },
  entreprise: { field: "company", label: "Entreprise" },
  company: { field: "company", label: "Company" },
  organisation: { field: "organisation", label: "Organisation" },
  // English
  "first name": { field: "firstname", label: "First Name" },
  firstname: { field: "firstname", label: "First Name" },
  "last name": { field: "lastname", label: "Last Name" },
  lastname: { field: "lastname", label: "Last Name" },
  phone: { field: "phone", label: "Phone" },
  "phone number": { field: "phone", label: "Phone" },
  // Plan/Price
  plan: { field: "__plan__", label: "Plan" },
  formule: { field: "__plan__", label: "Plan" },
  prix: { field: "__price__", label: "Prix" },
  price: { field: "__price__", label: "Price" },
  montant: { field: "__price__", label: "Montant" },
  amount: { field: "__price__", label: "Amount" },
  catégorie: { field: "__category__", label: "Catégorie" },
  categorie: { field: "__category__", label: "Catégorie" },
  category: { field: "__category__", label: "Category" },
};

const ASSIGNABLE_FIELDS = [
  { value: "skip", label: "⏭️ Ignorer" },
  { value: "firstname", label: "Prénom" },
  { value: "lastname", label: "Nom" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Téléphone" },
  { value: "city", label: "Ville" },
  { value: "country", label: "Pays" },
  { value: "company", label: "Société" },
  { value: "organisation", label: "Organisation" },
  { value: "__plan__", label: "Plan" },
  { value: "__price__", label: "Prix" },
  { value: "__category__", label: "Catégorie" },
  { value: "custom", label: "Champ personnalisé" },
];

type Step = "upload" | "mapping" | "preview" | "importing" | "done";

type ColumnMapping = {
  excelHeader: string;
  assignedField: string;
  customLabel?: string;
};

interface ImportParticipantsDialogProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportParticipantsDialog({
  eventId,
  isOpen,
  onClose,
}: ImportParticipantsDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const resetState = useCallback(() => {
    setStep("upload");
    setFileName("");
    setRawHeaders([]);
    setRawRows([]);
    setColumnMappings([]);
    setImportProgress(0);
    setImportResult(null);
    setIsDragging(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const autoMapColumn = (header: string): string => {
    const normalized = header
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const known = KNOWN_FIELDS[normalized];
    if (known) return known.field;
    // Partial match
    for (const [key, val] of Object.entries(KNOWN_FIELDS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return val.field;
      }
    }
    return "custom";
  };

  const processFile = async (file: File) => {
    setFileName(file.name);

    try {
      const xlsxModule = await import("xlsx");
      const XLSX: any = (xlsxModule as any).default ?? xlsxModule;

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (jsonData.length < 2) {
        alert("Le fichier doit contenir au moins un en-tête et une ligne de données.");
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h || "").trim());
      const rows = jsonData.slice(1).filter((row: any[]) =>
        row.some((cell: any) => String(cell || "").trim() !== "")
      );

      setRawHeaders(headers);
      setRawRows(rows.map((r: any[]) => r.map((c: any) => String(c ?? ""))));

      // Auto-map columns
      const mappings: ColumnMapping[] = headers.map((h) => ({
        excelHeader: h,
        assignedField: autoMapColumn(h),
        customLabel: h,
      }));
      setColumnMappings(mappings);
      setStep("mapping");
    } catch (err) {
      console.error("File parsing error:", err);
      alert("Erreur lors de la lecture du fichier. Vérifiez le format (xlsx/xls).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const updateMapping = (index: number, field: string) => {
    setColumnMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, assignedField: field } : m))
    );
  };

  const buildParticipantRows = (): ImportedParticipantRow[] => {
    return rawRows.map((row) => {
      const fields: { label: string; field: string; value: string }[] = [];
      let planName = "";
      let planPrice = "";
      let category = "";

      columnMappings.forEach((mapping, colIdx) => {
        const value = row[colIdx] || "";
        if (mapping.assignedField === "skip" || !value.trim()) return;

        if (mapping.assignedField === "__plan__") {
          planName = value;
        } else if (mapping.assignedField === "__price__") {
          planPrice = value;
        } else if (mapping.assignedField === "__category__") {
          category = value.toLowerCase();
        } else {
          fields.push({
            label: mapping.customLabel || mapping.excelHeader,
            field: mapping.assignedField === "custom"
              ? mapping.excelHeader
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, "_")
              : mapping.assignedField,
            value,
          });
        }
      });

      return { fields, planName, planPrice, category };
    });
  };

  const handleImport = async () => {
    setStep("importing");
    setImportProgress(10);

    const participants = buildParticipantRows();
    setImportProgress(30);

    try {
      const result = await bulkImportParticipants({
        eventId,
        participants,
      });
      setImportProgress(100);
      setImportResult(result);
      setStep("done");
      // Refresh the orders list
      queryClient.invalidateQueries({ queryKey: ["orders", eventId] });
    } catch (err: any) {
      setImportResult({
        created: 0,
        skipped: 0,
        errors: [err.message || "Erreur inconnue"],
      });
      setStep("done");
    }
  };

  const activeFieldCount = columnMappings.filter(
    (m) => m.assignedField !== "skip"
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Importer des participants
          </DialogTitle>
          <DialogDescription>
            Importez une liste de participants depuis un fichier Excel (.xlsx / .xls)
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          {[
            { key: "upload", label: "Fichier" },
            { key: "mapping", label: "Colonnes" },
            { key: "preview", label: "Aperçu" },
            { key: "done", label: "Résultat" },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center gap-1">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold transition-colors ${
                  step === s.key || (step === "importing" && s.key === "done")
                    ? "bg-emerald-600 text-white"
                    : ["mapping", "preview", "importing", "done"].indexOf(step) >=
                      ["upload", "mapping", "preview", "done"].indexOf(s.key)
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span className={step === s.key ? "font-medium text-foreground" : ""}>
                {s.label}
              </span>
              {i < arr.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 mx-1" />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 overflow-auto pr-2">
          {/* STEP: Upload */}
          {step === "upload" && (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Glissez votre fichier Excel ici
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou cliquez pour parcourir • .xlsx, .xls
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Column Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    <FileSpreadsheet className="w-4 h-4 inline mr-1 text-emerald-600" />
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rawRows.length} ligne(s) • {rawHeaders.length} colonne(s)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Changer de fichier
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Associez chaque colonne du fichier à un champ participant :
              </p>

              <div className="space-y-2">
                {columnMappings.map((mapping, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mapping.excelHeader || `Colonne ${idx + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        ex: {rawRows[0]?.[idx] || "—"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="w-48 shrink-0">
                      <Select
                        value={mapping.assignedField}
                        onValueChange={(val) => updateMapping(idx, val)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {ASSIGNABLE_FIELDS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold">
                  Aperçu de l&apos;import ({rawRows.length} participants)
                </h3>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">
                          #
                        </th>
                        {columnMappings
                          .filter((m) => m.assignedField !== "skip")
                          .map((m, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left font-medium text-xs"
                            >
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-normal"
                              >
                                {ASSIGNABLE_FIELDS.find(
                                  (f) => f.value === m.assignedField
                                )?.label || m.excelHeader}
                              </Badge>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawRows.slice(0, 10).map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-3 py-2 text-muted-foreground text-xs">
                            {rowIdx + 1}
                          </td>
                          {columnMappings
                            .map((m, colIdx) => ({ m, colIdx }))
                            .filter(({ m }) => m.assignedField !== "skip")
                            .map(({ colIdx }, ci) => (
                              <td key={ci} className="px-3 py-2 truncate max-w-[200px]">
                                {row[colIdx] || "—"}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rawRows.length > 10 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                    … et {rawRows.length - 10} autres lignes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP: Importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Import en cours…</p>
                <p className="text-sm text-muted-foreground">
                  {rawRows.length} participants en cours de traitement
                </p>
              </div>
              <div className="w-full max-w-xs">
                <Progress value={importProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === "done" && importResult && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                {importResult.errors.length === 0 ? (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold">Import terminé</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="text-2xl font-bold text-emerald-600">
                    {importResult.created}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Créés</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <p className="text-2xl font-bold text-amber-600">
                    {importResult.skipped}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <SkipForward className="w-3 h-3" />
                    Doublons
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                  <p className="text-2xl font-bold text-red-600">
                    {importResult.errors.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Erreurs
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-800/50 p-3 max-h-32 overflow-auto">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                    Détails des erreurs :
                  </p>
                  {importResult.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">
                      {err}
                    </p>
                  ))}
                  {importResult.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      … et {importResult.errors.length - 10} autres erreurs
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2">
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={resetState}>
                Retour
              </Button>
              <Button
                onClick={() => setStep("preview")}
                disabled={activeFieldCount === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                Aperçu
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Retour
              </Button>
              <Button
                onClick={handleImport}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importer {rawRows.length} participants
              </Button>
            </>
          )}

          {step === "done" && (
            <Button onClick={handleClose}>Fermer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
