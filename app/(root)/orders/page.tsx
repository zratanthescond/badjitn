import type { SearchParamProps } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Briefcase, Ticket, Settings, Landmark } from "lucide-react";
import CertificationAdministration from "@/components/admin/certification-administration";
import OrderAdministration from "@/components/admin/order-administration";
import WorkAdministration from "@/components/admin/work-administration";
import BankTransferAdministration from "@/components/admin/bank-transfer-administration";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@clerk/nextjs/server";

import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { getEventById } from "@/lib/actions/event.actions";
import { getCertificationByEventId } from "@/lib/actions/certification.actions";
import { getUserWorkByEventId } from "@/lib/actions/user.actions";
import OrdersEvolutionChart from "@/components/admin/OrdersEvolutionChart";

const Orders = async (props: SearchParamProps) => {
  const searchParams = await props.searchParams;
  const t = await getTranslations("orders");
  const locale = await getLocale();
  const isRTL = locale === "ar";

  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";

  // Get user ID for verification tracking
  const { userId } = await auth();
  const currentUserId = userId || "";

  // Fetch actual stats data
  const ordersData = await getOrdersByEvent({ eventId, searchString: "" });
  const eventData = eventId ? await getEventById(eventId) : null;
  const certificationsData = await getCertificationByEventId({ eventId, searchString: "" });
  const worksData = await getUserWorkByEventId({ eventId, searchString: "" });

  const totalOrders = ordersData ? ordersData.length : 0;
  const totalCertifications = certificationsData ? certificationsData.length : 0;
  const totalWorks = worksData ? worksData.length : 0;

  const isFreeEvent = eventData?.isFree || eventData?.price === "0" || Number(eventData?.price) === 0;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${isRTL ? "rtl" : "ltr"
        }`}
    >
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div
            className={`flex items-center gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 glass backdrop-blur-sm">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h1
                className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""
                  }`}
              >
                {t("title")}
              </h1>
              <p
                className={`text-muted-foreground mt-2 text-lg ${isRTL ? "font-arabic" : ""
                  }`}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Ticket className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.totalOrders")}
                  </p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.certifications")}
                  </p>
                  <p className="text-2xl font-bold">{totalCertifications}</p>
                </div>
              </div>
            </div>

            <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                  }`}
              >
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p
                    className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("stats.works")}
                  </p>
                  <p className="text-2xl font-bold">{totalWorks}</p>
                </div>
              </div>
            </div>
          </div>
          
          <OrdersEvolutionChart orders={ordersData || []} />
        </div>

        {/* Main Content */}
        <div className="glass bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList
              className={`flex justify-start md:justify-center overflow-x-auto h-auto min-h-[4rem] items-center md:grid w-full ${!isFreeEvent ? 'md:grid-cols-4' : 'md:grid-cols-3'} mb-6 sm:mb-8 glass bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-slate-600/50 rounded-2xl p-1 sm:p-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 ${isRTL ? "font-arabic flex-row-reverse" : ""
                }`}
            >
              <TabsTrigger
                value="orders"
                className={`flex flex-row items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap shrink-0 px-4 py-2 my-1 data-[state=active]:glass data-[state=active]:bg-white/90 data-[state=active]:dark:bg-slate-600/90 data-[state=active]:shadow-md rounded-xl transition-all duration-300 ${isRTL ? "flex-row-reverse font-arabic" : ""
                  }`}
              >
                <Ticket className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="hidden sm:inline">
                  {t("tabs.orderAdministration")}
                </span>
                <span className="sm:hidden">{t("tabs.orders")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="certifications"
                className={`flex flex-row items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap shrink-0 px-4 py-2 my-1 data-[state=active]:glass data-[state=active]:bg-white/90 data-[state=active]:dark:bg-slate-600/90 data-[state=active]:shadow-md rounded-xl transition-all duration-300 ${isRTL ? "flex-row-reverse font-arabic" : ""
                  }`}
              >
                <Award className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="hidden sm:inline">
                  {t("tabs.certificationAdministration")}
                </span>
                <span className="sm:hidden">{t("tabs.certifications")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="works"
                className={`flex flex-row items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap shrink-0 px-4 py-2 my-1 data-[state=active]:glass data-[state=active]:bg-white/90 data-[state=active]:dark:bg-slate-600/90 data-[state=active]:shadow-md rounded-xl transition-all duration-300 ${isRTL ? "flex-row-reverse font-arabic" : ""
                  }`}
              >
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="hidden sm:inline">
                  {t("tabs.workAdministration")}
                </span>
                <span className="sm:hidden">{t("tabs.works")}</span>
              </TabsTrigger>

              {!isFreeEvent && (
                <TabsTrigger
                  value="bank-transfers"
                  className={`flex flex-row items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap shrink-0 px-4 py-2 my-1 data-[state=active]:glass data-[state=active]:bg-white/90 data-[state=active]:dark:bg-slate-600/90 data-[state=active]:shadow-md rounded-xl transition-all duration-300 ${isRTL ? "flex-row-reverse font-arabic" : ""
                    }`}
                >
                  <Landmark className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="hidden sm:inline">{t("tabs.bankTransfers")}</span>
                  <span className="sm:hidden">{t("tabs.bankTransfersShort")}</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="orders" className="rounded-2xl">
              <div className="glass bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 rounded-2xl p-6">
                <div
                  className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Ticket className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2
                    className={`text-xl font-semibold text-green-800 dark:text-green-200 ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("sections.orderManagement")}
                  </h2>
                </div>
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
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="rounded-2xl">
              <div className="glass bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30 rounded-2xl p-6">
                <div
                  className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2
                    className={`text-xl font-semibold text-purple-800 dark:text-purple-200 ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("sections.certificationManagement")}
                  </h2>
                </div>
                <CertificationAdministration
                  eventId={eventId}
                  searchString={searchText}
                />
              </div>
            </TabsContent>

            <TabsContent value="works" className="rounded-2xl">
              <div className="glass bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30 rounded-2xl p-6">
                <div
                  className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2
                    className={`text-xl font-semibold text-orange-800 dark:text-orange-200 ${isRTL ? "font-arabic" : ""
                      }`}
                  >
                    {t("sections.workManagement")}
                  </h2>
                </div>
                <WorkAdministration
                  eventId={eventId}
                  searchString={searchText}
                />
              </div>
            </TabsContent>

            {!isFreeEvent && (
              <TabsContent value="bank-transfers" className="rounded-2xl">
                <div className="glass bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20 backdrop-blur-sm border border-pink-200/30 dark:border-pink-700/30 rounded-2xl p-6">
                  <div
                    className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""
                      }`}
                  >
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <Landmark className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2
                      className={`text-xl font-semibold text-pink-800 dark:text-pink-200 ${isRTL ? "font-arabic" : ""
                        }`}
                    >
                      {t("tabs.bankTransfers")}
                    </h2>
                  </div>
                  <BankTransferAdministration
                    eventId={eventId}
                    eventTitle={eventData?.title || ""}
                    searchString={searchText}
                    userId={currentUserId}
                    eventCountry={eventData?.country || ""}
                    eventLocation={eventData?.location}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Orders;
