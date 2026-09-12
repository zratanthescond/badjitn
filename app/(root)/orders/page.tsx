import type { SearchParamProps } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Briefcase, Ticket, Landmark, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CertificationAdministration from "@/components/admin/certification-administration";
import OrderAdministration from "@/components/admin/order-administration";
import WorkAdministration from "@/components/admin/work-administration";
import BankTransferAdministration from "@/components/admin/bank-transfer-administration";
import { AdminThemeScope } from "@/components/admin/ui/AdminThemeScope";
import { StatCard } from "@/components/admin/ui/StatCard";
import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { getEventById } from "@/lib/actions/event.actions";
import { getCertificationByEventId } from "@/lib/actions/certification.actions";
import { getBankTransferStats } from "@/lib/actions/banktransfer.actions";
import { getUserWorkByEventId, useUser } from "@/lib/actions/user.actions";
import OrdersEvolutionChart from "@/components/admin/OrdersEvolutionChart";

const Orders = async (props: SearchParamProps) => {
  const searchParams = await props.searchParams;
  const t = await getTranslations("orders");
  const locale = await getLocale();
  const isRTL = locale === "ar";

  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";

  // Get database user
  const user = await useUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch event data and verify permissions
  const eventData = eventId ? await getEventById(eventId) : null;
  if (eventId) {
    if (!eventData) {
      redirect("/");
    }
    const isOrganizer = eventData.organizer?._id?.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    if (!isOrganizer && !isAdmin) {
      redirect("/");
    }
  } else {
    // If no eventId is provided, only allow admin to load
    if (user.role !== "admin") {
      redirect("/");
    }
  }

  const currentUserId = user.clerkId || "";

  // Fetch actual stats data
  const ordersData = await getOrdersByEvent({ eventId, searchString: "" });
  const certificationsData = await getCertificationByEventId({ eventId, searchString: "" });
  const worksData = await getUserWorkByEventId({ eventId, searchString: "" });

  const totalOrders = ordersData ? ordersData.length : 0;
  const totalCertifications = certificationsData ? certificationsData.length : 0;
  const totalWorks = worksData ? worksData.length : 0;

  const isFreeEvent = eventData?.isFree || eventData?.price === "0" || Number(eventData?.price) === 0;
  const bankTransferStats = !isFreeEvent
    ? await getBankTransferStats(eventData?.title || "")
    : null;

  return (
    <AdminThemeScope>
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
        {/* Event context bar */}
        <div className="bg-admin-navy text-white">
          <div
            className={`container mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div className={`flex min-w-0 items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="h-2 w-2 shrink-0 rounded-full bg-admin-success" />
              <span className={`truncate text-sm font-semibold ${isRTL ? "font-arabic" : ""}`}>
                {eventData?.title || t("title")}
              </span>
            </div>
            <Link
              href="/profile"
              className={`flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 ${isRTL ? "flex-row-reverse" : ""
                }`}
            >
              <ArrowLeft className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
              {tx(t, "backToProfile", "Mon profil")}
            </Link>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`font-outfit text-2xl font-bold tracking-tight text-foreground sm:text-3xl ${isRTL ? "font-arabic" : ""
                }`}
            >
              {t("title")}
            </h1>
            <p className={`mt-1 text-sm text-muted-foreground sm:text-base ${isRTL ? "font-arabic" : ""}`}>
              {t("subtitle")}
            </p>
          </div>

          {/* KPIs */}
          <div className={`mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${!isFreeEvent ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            <StatCard
              label={t("stats.totalOrders")}
              value={totalOrders}
              icon={<Ticket className="h-4 w-4" />}
              accent="blue"
              isRTL={isRTL}
            />
            <StatCard
              label={t("stats.certifications")}
              value={totalCertifications}
              icon={<Award className="h-4 w-4" />}
              accent="neutral"
              isRTL={isRTL}
            />
            <StatCard
              label={t("stats.works")}
              value={totalWorks}
              icon={<Briefcase className="h-4 w-4" />}
              accent="neutral"
              isRTL={isRTL}
            />
            {!isFreeEvent && bankTransferStats && (
              <StatCard
                label={tx(t, "stats.pendingTransfers", "Virements à valider")}
                value={bankTransferStats.pending}
                icon={<Landmark className="h-4 w-4" />}
                accent={bankTransferStats.pending > 0 ? "amber" : "neutral"}
                isRTL={isRTL}
              />
            )}
          </div>

          <div className="mb-6">
            <OrdersEvolutionChart orders={ordersData || []} />
          </div>

          {/* Main Content */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList
                className={`mb-6 flex h-auto w-full items-center justify-start gap-1 overflow-x-auto rounded-full border border-border bg-muted/60 p-1 sm:justify-center ${isRTL ? "flex-row-reverse font-arabic" : ""
                  }`}
              >
                <TabsTrigger
                  value="orders"
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm ${isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                >
                  <Ticket className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("tabs.orderAdministration")}</span>
                  <span className="sm:hidden">{t("tabs.orders")}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {totalOrders}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="certifications"
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm ${isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                >
                  <Award className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("tabs.certificationAdministration")}</span>
                  <span className="sm:hidden">{t("tabs.certifications")}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {totalCertifications}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="works"
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm ${isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                >
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("tabs.workAdministration")}</span>
                  <span className="sm:hidden">{t("tabs.works")}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {totalWorks}
                  </span>
                </TabsTrigger>

                {!isFreeEvent && (
                  <TabsTrigger
                    value="bank-transfers"
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm ${isRTL ? "flex-row-reverse font-arabic" : ""
                      }`}
                  >
                    <Landmark className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{t("tabs.bankTransfers")}</span>
                    <span className="sm:hidden">{t("tabs.bankTransfersShort")}</span>
                    {bankTransferStats && (
                      <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {bankTransferStats.total}
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="orders">
                <OrderAdministration
                  eventId={eventId}
                  searchString={searchText}
                  eventCountry={eventData?.country || ""}
                  eventLocation={eventData?.location}
                  isFreeEvent={isFreeEvent}
                  eventTitle={eventData?.title || ""}
                  organisationName={eventData?.organisation?.name || ""}
                  eventStartDateTime={eventData?.startDateTime}
                  eventEndDateTime={eventData?.endDateTime}
                  eventPlace={eventData?.location?.name || ""}
                />
              </TabsContent>

              <TabsContent value="certifications">
                <CertificationAdministration eventId={eventId} searchString={searchText} />
              </TabsContent>

              <TabsContent value="works">
                <WorkAdministration eventId={eventId} searchString={searchText} />
              </TabsContent>

              {!isFreeEvent && (
                <TabsContent value="bank-transfers">
                  <BankTransferAdministration
                    eventId={eventId}
                    eventTitle={eventData?.title || ""}
                    searchString={searchText}
                    userId={currentUserId}
                    eventCountry={eventData?.country || ""}
                    eventLocation={eventData?.location}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </AdminThemeScope>
  );
};

// Safe translation with fallback (mirrors the `tx` convention already used
// across the admin components) so newly-added strings don't need every
// locale file updated before shipping.
function tx(t: Awaited<ReturnType<typeof getTranslations>>, key: string, fallback: string) {
  return t.has(key as any) ? t(key as any) : fallback;
}

export default Orders;
