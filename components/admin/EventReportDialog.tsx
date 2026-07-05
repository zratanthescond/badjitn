"use client";

import React, { Fragment, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getEventReportData } from "@/lib/actions/event.actions";
import { formatDateTime, getCurrencyCodeByCountry } from "@/lib/utils";
import { Download, FileText, Loader2, Mail, Printer } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";

interface EventReportDialogProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

type CountMap = Record<string, number>;

const getMapMax = (map?: CountMap) => {
  const values = Object.values(map || {});
  return values.length > 0 ? Math.max(...values) : 1;
};

const getMapTotal = (map?: CountMap) =>
  Object.values(map || {}).reduce((sum, value) => sum + Number(value || 0), 0);

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

export default function EventReportDialog({ eventId, isOpen, onClose }: EventReportDialogProps) {
  const t = useTranslations("eventReport");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  const locale = useLocale();
  const isRTL = locale === "ar";
  const reportRef = useRef<HTMLDivElement>(null);
  const printFn = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `event-report-${eventId || "report"}`,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["eventReport", eventId],
    queryFn: () => getEventReportData(eventId),
    enabled: isOpen && !!eventId,
  });

  const event = data?.event;
  const stats = data?.stats;
  const scanPointData = data?.scanPointData || {};

  const ticketTypeLabels: Record<string, string> = {
    paid: t("ticketTypes.paid"),
    free: t("ticketTypes.free"),
    hosted: t("ticketTypes.hosted"),
    doorpay: t("ticketTypes.doorpay"),
    bank_transfer: t("ticketTypes.bankTransfer"),
  };

  const categoryLabels: Record<string, string> = {
    attendee: t("categories.attendee"),
    speaker: t("categories.speaker"),
    sponsor: t("categories.sponsor"),
    staff: t("categories.staff"),
  };

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: getCurrencyCodeByCountry(event?.country, event?.location),
        maximumFractionDigits: 2,
      }),
    [event?.country, locale]
  );

  const totalScanEntries = useMemo(
    () =>
      Object.values(scanPointData).reduce((acc: number, point: any) => {
        return acc + Number(point?.count || 0);
      }, 0),
    [scanPointData]
  );

  const scanCoverage = useMemo(() => {
    const totalOrders = Number(stats?.totalOrders || 0);
    if (totalOrders === 0) return 0;
    return Math.min(100, (totalScanEntries / totalOrders) * 100);
  }, [stats?.totalOrders, totalScanEntries]);

  const handlePrint = useCallback(() => {
    printFn();
  }, [printFn]);

  const handleDownload = useCallback(() => {
    // Keep the same pagination engine as print; users can choose "Save as PDF".
    printFn();
  }, [printFn]);

  const getShareText = useCallback(() => {
    if (!event) return "";
    const reportLink = `${window.location.origin}/orders?eventId=${eventId}`;
    return [
      `${t("shareSubject")}: ${event.title}`,
      `${formatDateTime(event.startDateTime).dateOnly} - ${formatDateTime(event.endDateTime).dateOnly}`,
      `${event.location?.name || t("fields.online")}`,
      `${t("totalOrders")}: ${stats?.totalOrders || 0}`,
      `${t("totalRevenue")}: ${currency.format(Number(stats?.totalRevenue || 0))}`,
      `${t("uniqueAttendees")}: ${stats?.uniqueBuyers || 0}`,
      `${t("shareLinkLabel")}: ${reportLink}`,
    ].join("\n");
  }, [currency, event, eventId, stats, t]);

  const handleShareEmail = useCallback(() => {
    const subject = encodeURIComponent(`${t("shareSubject")}: ${event?.title || ""}`);
    const body = encodeURIComponent(getShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, [event?.title, getShareText, t]);

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [getShareText]);

  const orderTrendValues = useMemo(
    () => (stats?.orderTrend || []).map((item: any) => Number(item.orders || 0)),
    [stats?.orderTrend]
  );
  const trendPolyline = useMemo(
    () => getTrendPolyline(orderTrendValues),
    [orderTrendValues]
  );

  const typeMax = useMemo(() => getMapMax(stats?.ordersByType), [stats?.ordersByType]);
  const categoryMax = useMemo(() => getMapMax(stats?.ordersByCategory), [stats?.ordersByCategory]);
  const hourMax = useMemo(() => getMapMax(stats?.scanActivityByHour), [stats?.scanActivityByHour]);

  const highlights = useMemo(() => {
    if (!stats || Number(stats.totalOrders || 0) === 0) return [t("highlights.noOrders")];
    const lines = [
      t("highlights.ordersAndAttendees", {
        orders: Number(stats.totalOrders || 0),
        attendees: Number(stats.uniqueBuyers || 0),
      }),
      t("highlights.avgOrder", {
        amount: currency.format(Number(stats.averageOrderValue || 0)),
      }),
      t("highlights.attendanceRate", {
        rate: Number(stats.attendanceRate || 0),
        scanned: Number(stats.uniqueScannedAttendees || 0),
      }),
    ];
    if (stats?.topPricePlans?.length > 0) {
      lines.push(
        t("highlights.topPlan", {
          plan: stats.topPricePlans[0].name,
          orders: Number(stats.topPricePlans[0].orders || 0),
        })
      );
    }
    return lines;
  }, [currency, stats, t]);

  const isFreeEvent = useMemo(() => {
    if (!event || !stats) return false;
    const planIsFree = event.pricePlan?.length > 0 && event.pricePlan.every((p: any) => Number(p.price || 0) === 0);
    const eventIsFreeFlag = event.isFree;
    const revIsZero = Number(stats.totalRevenue || 0) === 0 && !stats.ordersByType?.paid;
    return eventIsFreeFlag || planIsFree || revIsZero;
  }, [event, stats]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 bg-slate-950 border border-slate-800 ${isRTL ? "rtl" : "ltr"}`}>
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 p-4">
          <div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <DialogHeader className="space-y-0">
              <DialogTitle className={`text-lg font-bold text-slate-100 flex items-center gap-2 ${isRTL ? "flex-row-reverse font-arabic" : ""}`}>
                <FileText className="h-5 w-5 text-blue-400" />
                {t("title")}
              </DialogTitle>
            </DialogHeader>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
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
              <p className={`text-slate-300 ${isRTL ? "font-arabic" : ""}`}>{t("loading")}</p>
            </div>
          ) : event ? (
            <div ref={reportRef} className="report-root rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900">
              <div className="text-center border-b-[3px] border-blue-600 pb-5 mb-6">
                <img src="/assets/images/logoDark.png" alt="badgi" className="h-12 w-auto object-contain mx-auto mb-2" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{event.title}</h1>
                <p className="text-sm text-slate-500">{t("generatedOn")} {new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>

              <div className="mb-6 report-section">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{t("sections.eventInfo")}</h3>
                <div className="grid sm:grid-cols-2 gap-2 no-split">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase text-slate-500">{t("fields.category")}</div><div className="font-semibold">{event.category?.name || "-"}</div></div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[11px] uppercase text-slate-500">{t("fields.organizer")}</div>
                    <div className="font-semibold text-slate-900">{event.organisation?.name || (event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : "-")}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase text-slate-500">{t("fields.date")}</div><div className="font-semibold">{formatDateTime(event.startDateTime).dateOnly} - {formatDateTime(event.endDateTime).dateOnly}</div></div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] uppercase text-slate-500">{t("fields.location")}</div><div className="font-semibold">{event.location?.name || (event.isOnline ? t("fields.online") : "-")}</div></div>
                </div>
                {event.description && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 no-split">
                    <div className="text-[11px] uppercase text-slate-500 mb-1">{t("fields.description")}</div>
                    {event.organisation?.logo && (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 mb-2">
                        <img src={event.organisation.logo} alt={tx("organizationLogoAlt", "Organization logo")} className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="text-xs text-slate-500">{t("organizedByLabel") || "Organisateur"}</div>
                          <div className="text-sm font-semibold text-slate-800">{event.organisation.name}</div>
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />
                  </div>
                )}
              </div>

              {event.pricePlan?.length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{tx("sections.pricePlans", "Plans de l'événement")}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 no-split">
                    {event.pricePlan.map((plan: any, i: number) => (
                      <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex flex-col h-full">
                        <div className="font-semibold text-amber-900 mb-1">{plan.name}</div>
                        <div className="text-xl font-extrabold text-amber-700">{Number(plan.price) === 0 ? t("free") : currency.format(Number(plan.price || 0))}</div>
                        {plan.places && <div className="text-[10px] text-amber-700 mt-1 font-medium">{plan.places} {t("seats")}</div>}
                        {plan.note && <div className="text-[10px] text-amber-800/80 italic mt-0.5">{plan.note}</div>}
                        
                        {plan.options && plan.options.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-amber-200/50">
                            <div className="text-[9px] uppercase font-bold text-amber-800/70 mb-1">{tx("availableChoices", "Choix disponibles :")}</div>
                            <div className="flex flex-wrap gap-1">
                              {plan.options.map((opt: string, optIdx: number) => (
                                <span key={optIdx} className="text-[9px] bg-white/70 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded leading-tight">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 report-section">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{t("sections.orderStats")}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4 no-split">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5"><div className="text-[11px] text-blue-700/80">{t("totalOrders")}</div><div className="text-2xl font-extrabold text-blue-700">{stats?.totalOrders || 0}</div></div>
                  {!isFreeEvent && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"><div className="text-[11px] text-emerald-700/80">{t("totalRevenue")}</div><div className="text-2xl font-extrabold text-emerald-700">{currency.format(Number(stats?.totalRevenue || 0))}</div></div>}
                  <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5"><div className="text-[11px] text-violet-700/80">{t("uniqueAttendees")}</div><div className="text-2xl font-extrabold text-violet-700">{stats?.uniqueBuyers || 0}</div></div>
                  {totalScanEntries > 0 && <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2.5"><div className="text-[11px] text-cyan-700/80">{t("scanCoverage")}</div><div className="text-2xl font-extrabold text-cyan-700">{scanCoverage.toFixed(1)}%</div></div>}
                </div>

              </div>

              <div className="mb-6 report-section">
                <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{tx("sections.registrationTrend", "Évolution des inscriptions (3h)")}</h3>
                
                <div className={`grid ${totalScanEntries > 0 ? "lg:grid-cols-2" : "grid-cols-1"} gap-3 no-split`}>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 no-split">
                    <div className="text-sm font-semibold text-slate-700 mb-2">{tx("charts.registrationActivity", "Courbe d'activité (inscriptions)")}</div>
                    {orderTrendValues.length > 0 ? (
                      <div>
                        <svg viewBox="0 0 320 100" className="w-full h-28">
                          <defs>
                            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
                            </linearGradient>
                          </defs>
                          <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={trendPolyline} />
                          <polyline fill="url(#trendGradient)" stroke="none" points={`0,100 ${trendPolyline} 320,100`} />
                        </svg>
                        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                          <span>{stats?.orderTrend?.[0]?.date || "-"}</span>
                          <span>{stats?.orderTrend?.[stats?.orderTrend?.length - 1]?.date || "-"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 py-8 text-center">{t("charts.ordersTrendEmpty")}</div>
                    )}
                  </div>

                  {totalScanEntries > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 no-split">
                      <div className="text-sm font-semibold text-slate-700 mb-2">{t("charts.scanHourlyTitle")}</div>
                      <div className="grid gap-1">
                        {Object.entries(stats?.scanActivityByHour || {})
                          .filter(([h]) => Number(h) % 3 === 0)
                          .map(([hour, count]) => {
                            const value = Number(count || 0);
                            const width = Math.max(5, (value / hourMax) * 100);
                            return (
                              <div key={hour} className="grid grid-cols-[40px_1fr_36px] items-center gap-2 text-xs">
                                <span className="text-slate-500">{hour}h</span>
                                <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600" style={{ width: `${width}%` }} /></div>
                                <span className="text-right font-semibold text-slate-700">{value}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {stats?.topPricePlans?.length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{tx("sections.planStats", "Statistiques des plans")}</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 no-split">
                    <table className="w-full border-collapse text-xs report-table">
                      <thead>
                        <tr>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.plan", "Plan")}</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.participations", "Participations")}</th>
                          {!isFreeEvent && <th className="bg-slate-100 px-2.5 py-2 text-right font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.revenue", "Revenu")}</th>}
                          {!isFreeEvent && <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200 w-24">{tx("tableHeaders.weight", "Poids %")}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topPricePlans.map((plan: any) => {
                          const ratio = Number(stats?.totalRevenue || 0) > 0
                            ? (Number(plan.revenue || 0) / Number(stats.totalRevenue || 1)) * 100
                            : 0;
                          return (
                            <Fragment key={plan.name}>
                              <tr className="no-split-row bg-slate-50/50">
                                <td className="px-2.5 py-2 border-b border-slate-200 text-slate-900 font-bold">{plan.name}</td>
                                <td className="px-2.5 py-2 border-b border-slate-200 text-slate-900 font-bold">{plan.orders}</td>
                                {!isFreeEvent && <td className="px-2.5 py-2 border-b border-slate-200 text-slate-900 font-bold">{currency.format(Number(plan.revenue || 0))}</td>}
                                {!isFreeEvent && <td className="px-2.5 py-2 border-b border-slate-200">
                                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${Math.min(100, Math.max(3, ratio))}%` }} /></div>
                                </td>}
                              </tr>
                              {plan.optionsBreakdown && plan.optionsBreakdown.map((opt: any) => (
                                <tr key={`${plan.name}-${opt.name}`} className="no-split-row italic">
                                  <td className="px-6 py-1.5 border-b border-slate-100 text-slate-600 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    {opt.name}
                                  </td>
                                  <td className="px-2.5 py-1.5 border-b border-slate-100 text-slate-600">{opt.orders}</td>
                                  {!isFreeEvent && <td className="px-2.5 py-1.5 border-b border-slate-100 text-slate-600">{currency.format(Number(opt.revenue || 0))}</td>}
                                  {!isFreeEvent && <td className="px-2.5 py-1.5 border-b border-slate-100" />}
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {stats?.participantsList && stats.participantsList.length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{tx("sections.participantsList", "Liste des Participants")}</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 no-split">
                    <table className="w-full border-collapse text-xs report-table">
                      <thead>
                        <tr>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.fullName", "Nom complet")}</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.email", "Email")}</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.phone", "Téléphone")}</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.city", "Ville")}</th>
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.planChoice", "Plan / Choix")}</th>
                          {!isFreeEvent && <th className="bg-slate-100 px-2.5 py-2 text-right font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.amount", "Montant")}</th>}
                          <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{tx("tableHeaders.registrationDate", "Date d'inscription")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.participantsList.map((p: any, idx: number) => (
                          <tr key={`pl-${idx}`} className="no-split-row border-b border-slate-100">
                            <td className="px-2.5 py-2 text-slate-700 font-medium">
                              {p.name}
                            </td>
                            <td className="px-2.5 py-2 text-slate-700">{p.email}</td>
                            <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{p.phone}</td>
                            <td className="px-2.5 py-2 text-slate-700">{p.city}</td>
                            <td className="px-2.5 py-2 text-slate-700 space-y-2">
                              {p.plans?.map((pl: any, pIdx: number) => (
                                <div key={pIdx} className="border-l-2 border-blue-200 pl-2 py-0.5">
                                  <span className="font-semibold block leading-tight text-[11px]">{pl.plan}</span>
                                  {pl.choice && <span className="block text-[10px] text-blue-600 leading-tight italic">{pl.choice}</span>}
                                </div>
                              ))}
                            </td>
                            {!isFreeEvent && <td className="px-2.5 py-2 text-right text-slate-700 font-semibold">{currency.format(p.totalAmount)}</td>}
                            <td className="px-2.5 py-2 text-slate-700 whitespace-nowrap">{formatDateTime(p.createdAt).dateOnly}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {stats?.participantsByPlan && Object.keys(stats.participantsByPlan).length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{tx("sections.participantsByPlan", "Participants par Plan")}</h3>
                  {Object.entries(stats.participantsByPlan).map(([planName, participants]: [string, any], idx: number) => {
                    const groupedByChoice = participants.reduce((acc: any, p: any) => {
                      const choice = p.choice || tx("noChoice", "Sans choix");
                      if (!acc[choice]) acc[choice] = [];
                      acc[choice].push(p);
                      return acc;
                    }, {} as Record<string, any[]>);

                    return (
                      <div key={`plan-${idx}`} className="mb-8 no-split">
                        <h4 className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-t-lg border-x border-t border-slate-200">
                          {planName} <span className="text-blue-600 ml-1">({participants.length} {tx("registered", "inscrits")})</span>
                        </h4>
                        
                        {Object.entries(groupedByChoice).map(([choice, pList]: [string, any], cIdx: number) => (
                          <div key={`${planName}-${choice}`} className="border-x border-b border-slate-200 last:rounded-b-lg overflow-hidden">
                            <div className="bg-blue-50/50 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">{choice}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{pList.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-[10px] report-table">
                                <thead>
                                  <tr className="bg-white">
                                    <th className="px-2.5 py-1.5 text-left font-semibold text-slate-500 border-b border-slate-100 w-[25%]">{tx("tableHeaders.fullName", "Nom complet")}</th>
                                    <th className="px-2.5 py-1.5 text-left font-semibold text-slate-500 border-b border-slate-100 w-[25%]">{tx("tableHeaders.email", "Email")}</th>
                                    <th className="px-2.5 py-1.5 text-left font-semibold text-slate-500 border-b border-slate-100 w-[20%]">{tx("tableHeaders.phone", "Téléphone")}</th>
                                    <th className="px-2.5 py-1.5 text-left font-semibold text-slate-500 border-b border-slate-100 w-[15%]">{tx("tableHeaders.city", "Ville")}</th>
                                    {!isFreeEvent && <th className="px-2.5 py-1.5 text-right font-semibold text-slate-500 border-b border-slate-100 w-[15%]">{tx("tableHeaders.amount", "Montant")}</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pList.map((p: any, pIdx: number) => (
                                    <tr key={`p-${idx}-${cIdx}-${pIdx}`} className="no-split-row border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                      <td className="px-2.5 py-1.5 text-slate-700 font-medium">{p.name}</td>
                                      <td className="px-2.5 py-1.5 text-slate-500">{p.email}</td>
                                      <td className="px-2.5 py-1.5 text-slate-500">{p.phone}</td>
                                      <td className="px-2.5 py-1.5 text-slate-500">{p.city}</td>
                                      {!isFreeEvent && <td className="px-2.5 py-1.5 text-right text-slate-600">{currency.format(p.amount)}</td>}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {Object.keys(scanPointData).length > 0 && (
                <div className="mb-6 report-section">
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">{t("sections.scanPoints")}</h3>
                  <div className="text-sm text-slate-500 mb-3">{t("scanPointsDescription")}</div>
                  {Object.entries(scanPointData).map(([pointName, pointData]: [string, any]) => (
                    <div key={pointName} className="mb-4 no-split">
                      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 mb-2">
                        <span className="font-semibold text-blue-800">{pointName}</span>
                        <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-xs font-semibold">{pointData.count} {t("entries")}</span>
                      </div>
                      {pointData.entries.length > 0 && (
                        <div className="overflow-x-auto no-split">
                          <table className="w-full border-collapse text-xs report-table">
                            <thead>
                              <tr>
                                <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">#</th>
                                <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{t("tableHeaders.attendee")}</th>
                                <th className="bg-slate-100 px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{t("tableHeaders.scannedAt")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pointData.entries.map((entry: any, idx: number) => (
                                <tr key={`${pointName}-${idx}`} className="no-split-row">
                                  <td className="px-2.5 py-2 border-b border-slate-100 text-slate-700">{idx + 1}</td>
                                  <td className="px-2.5 py-2 border-b border-slate-100 text-slate-700">{entry.attendee}</td>
                                  <td className="px-2.5 py-2 border-b border-slate-100 text-slate-700">{formatDateTime(entry.scannedAt).dateTime}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-8 pt-4 border-t-2 border-slate-200 text-xs text-slate-400">
                <img src="/assets/images/logoDark.png" alt="badgi" className="h-7 w-auto object-contain mx-auto mb-2" />
                <p>{t("footer")} - {new Date().getFullYear()} badgi.net</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">{t("noData")}</p>
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
