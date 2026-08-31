"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFormReportData } from "@/lib/actions/eventform.actions";
import { Download, FileText, Loader2, Mail, Printer } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";

interface FormReportDialogProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getMax = (counts: Record<string, number>) => {
  const values = Object.values(counts || {});
  return values.length > 0 ? Math.max(...values, 1) : 1;
};

const getTrendPolyline = (values: number[], width = 320, height = 100) => {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

export default function FormReportDialog({ formId, isOpen, onClose }: FormReportDialogProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const printFn = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `form-report-${formId || "report"}`,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["formReport", formId],
    queryFn: () => getFormReportData(formId),
    enabled: isOpen && !!formId,
    retry: false,
  });

  const form = data?.data?.form;
  const stats = data?.data?.stats;

  const trendValues = useMemo(
    () => (stats?.submissionTrend || []).map((item: any) => Number(item.count || 0)),
    [stats?.submissionTrend]
  );
  const trendPolyline = useMemo(() => getTrendPolyline(trendValues), [trendValues]);

  const handlePrint = useCallback(() => printFn(), [printFn]);
  const handleDownload = useCallback(() => printFn(), [printFn]);

  const getShareText = useCallback(() => {
    if (!form) return "";
    const link = typeof window !== "undefined" ? `${window.location.origin}/forms/${form.slug}` : "";
    return [
      `Rapport du formulaire : ${form.title}`,
      `Total des inscriptions : ${stats?.totalSubmissions || 0}`,
      `Emails invités : ${stats?.invitedCount || 0}`,
      `Lien du formulaire : ${link}`,
    ].join("\n");
  }, [form, stats]);

  const handleShareEmail = useCallback(() => {
    const subject = encodeURIComponent(`Rapport du formulaire : ${form?.title || ""}`);
    const body = encodeURIComponent(getShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, [form?.title, getShareText]);

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [getShareText]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 bg-slate-950 border border-slate-800">
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Rapport du formulaire
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} disabled={isLoading}><Printer className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={handleDownload} disabled={isLoading}><Download className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={handleShareEmail} disabled={isLoading}><Mail className="h-4 w-4" /></Button>
              <Button size="sm" onClick={handleShareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}><FaWhatsapp className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
              <p className="text-slate-300">Chargement du rapport...</p>
            </div>
          ) : form ? (
            <div ref={reportRef} className="report-root rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900">
              <div className="text-center border-b-[3px] border-blue-600 pb-5 mb-6">
                <img src="/assets/images/logoDark.png" alt="badgi" className="h-12 w-auto object-contain mx-auto mb-2" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{form.title}</h1>
                {form.description && <p className="text-sm text-slate-600 max-w-xl mx-auto">{form.description}</p>}
                <p className="text-sm text-slate-500 mt-2">
                  Généré le {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {form.organisation && (
                <div className="mb-6 report-section no-split">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-fit">
                    {form.organisation.logo && (
                      <img src={form.organisation.logo} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                    )}
                    <div>
                      <div className="text-xs text-slate-500">Organisateur</div>
                      <div className="text-sm font-semibold text-slate-800">{form.organisation.name}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 report-section">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Statistiques</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 no-split">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                    <div className="text-[11px] text-blue-700/80">Total des inscriptions</div>
                    <div className="text-2xl font-extrabold text-blue-700">{stats?.totalSubmissions || 0}</div>
                  </div>
                  <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
                    <div className="text-[11px] text-violet-700/80">Emails invités</div>
                    <div className="text-2xl font-extrabold text-violet-700">{stats?.invitedCount || 0}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="text-[11px] text-emerald-700/80">Champs du formulaire</div>
                    <div className="text-2xl font-extrabold text-emerald-700">{form.fields?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6 report-section">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Évolution des inscriptions</h3>
                <div className="rounded-xl border border-slate-200 bg-white p-3 no-split">
                  {trendValues.length > 0 ? (
                    <div>
                      <svg viewBox="0 0 320 100" className="w-full h-28">
                        <defs>
                          <linearGradient id="formTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
                          </linearGradient>
                        </defs>
                        <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={trendPolyline} />
                        <polyline fill="url(#formTrendGradient)" stroke="none" points={`0,100 ${trendPolyline} 320,100`} />
                      </svg>
                      <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                        <span>{stats?.submissionTrend?.[0]?.date || "-"}</span>
                        <span>{stats?.submissionTrend?.[stats?.submissionTrend?.length - 1]?.date || "-"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 py-8 text-center">Aucune inscription pour le moment.</div>
                  )}
                </div>
              </div>

              {stats?.fieldBreakdowns?.length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Répartition par champ</h3>
                  <div className="grid sm:grid-cols-2 gap-3 no-split">
                    {stats.fieldBreakdowns.map((field: any) => {
                      const max = getMax(field.counts);
                      return (
                        <div key={field.label} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-sm font-semibold text-slate-700 mb-2">{field.label}</div>
                          <div className="grid gap-1.5">
                            {Object.entries(field.counts).map(([option, count]: [string, any]) => (
                              <div key={option} className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
                                <div>
                                  <span className="text-slate-600">{option}</span>
                                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-0.5">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                      style={{ width: `${Math.max(3, (Number(count) / max) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-right font-semibold text-slate-700">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stats?.participantsList?.length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Liste des inscrits</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 no-split">
                    <table className="w-full border-collapse text-xs report-table">
                      <thead>
                        <tr>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Nom complet</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Email</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Réponses</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">Date d'inscription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.participantsList.map((p: any, idx: number) => (
                          <tr key={`pl-${idx}`} className="no-split-row border-b border-slate-100">
                            <td className="px-2.5 py-2 text-slate-700 font-medium whitespace-nowrap">{p.name}</td>
                            <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{p.email}</td>
                            <td className="px-2.5 py-2 text-slate-700 space-y-1">
                              {p.responses.map((r: any, rIdx: number) => (
                                <div key={rIdx} className="text-[11px]">
                                  <span className="font-semibold">{r.label}:</span>{" "}
                                  <span className="text-slate-600">{r.value || "-"}</span>
                                </div>
                              ))}
                            </td>
                            <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">
                              {new Date(p.submittedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="text-center mt-8 pt-4 border-t-2 border-slate-200 text-xs text-slate-400">
                <img src="/assets/images/logoDark.png" alt="badgi" className="h-7 w-auto object-contain mx-auto mb-2" />
                <p>Rapport généré automatiquement - {new Date().getFullYear()} badgi.net</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Aucune donnée disponible</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              )}
            </div>
          )}
        </div>
        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background-color: white !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .report-root {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-width: 100% !important;
            }
            .overflow-x-auto {
              overflow: visible !important;
              width: 100% !important;
            }
            .report-table {
              font-size: 7pt !important;
              width: 100% !important;
              table-layout: auto !important;
            }
            .report-table th, .report-table td {
              word-break: break-word !important;
              white-space: normal !important;
              padding: 2px 3px !important;
            }
            .report-section,
            .no-split,
            .no-split-row {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              overflow: visible !important;
            }
            .report-table thead {
              display: table-header-group;
            }
            .report-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
