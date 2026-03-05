"use client";

import { useEffect, useState } from "react";
import EventForm from "@/components/shared/EventForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Building2,
  Plus,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useGetOrganisations } from "@/hooks/useGetOrganisations";

interface CreateEventPageProps {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function CreateEventPage({ user }: CreateEventPageProps) {
  const t = useTranslations("createEventPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { organisations, loading: orgsLoading } = useGetOrganisations(
    user._id
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select if user only has one organisation
  useEffect(() => {
    if (organisations.length === 1 && !selectedOrgId) {
      setSelectedOrgId(organisations[0]._id);
    }
  }, [organisations, selectedOrgId]);

  if (!mounted) {
    return <CreateEventPageSkeleton isRTL={isRTL} />;
  }

  const selectedOrg = organisations.find(
    (org: any) => org._id === selectedOrgId
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 ${isRTL ? "rtl" : "ltr"
        }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div
            className={`flex items-center gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 glass backdrop-blur-sm">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h1
                className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isRTL ? "font-arabic" : ""
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
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* No Organisations - Prompt to create one */}
          {!orgsLoading && organisations.length === 0 && (
            <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-indigo-200/30 dark:border-indigo-700/30 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-indigo-100/50 dark:border-indigo-900/30">
                <div
                  className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""
                    }`}
                >
                  <div className="p-3 rounded-xl bg-indigo-500/20">
                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <CardTitle
                      className={`text-2xl text-indigo-800 dark:text-indigo-200 ${isRTL ? "font-arabic" : ""
                        }`}
                    >
                      Create an Organisation First
                    </CardTitle>
                    <CardDescription
                      className={`text-indigo-600 dark:text-indigo-300 text-lg ${isRTL ? "font-arabic" : ""
                        }`}
                    >
                      You need an organisation to publish events
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Events are published under organisations. Create your
                    organisation to get started — it&apos;s like your own page
                    where all your events will be displayed.
                  </p>

                  <div className="glass bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-700/30 rounded-2xl p-6">
                    <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4">
                      What you get with an organisation:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Your own dedicated page for all your events",
                        "Invite admins to help manage your events",
                        "Build your brand and community",
                        "Verified badge for trusted organisations",
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full transition-all duration-200 hover:scale-105 px-8 h-12 text-base"
                  >
                    <Link href="/organisations/create">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Organisation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Has Organisations - Show selector + form */}
          {!orgsLoading && organisations.length > 0 && (
            <>
              {/* Organisation Selector */}
              {organisations.length > 1 && (
                <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-500" />
                      Select Organisation
                    </CardTitle>
                    <CardDescription>
                      Choose which organisation to publish this event under
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {organisations.map((org: any) => (
                        <button
                          key={org._id}
                          onClick={() => setSelectedOrgId(org._id)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedOrgId === org._id
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md"
                            : "border-transparent glass bg-white/40 dark:bg-slate-900/40 hover:border-indigo-200 dark:hover:border-indigo-700/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={org.name}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm truncate">
                                  {org.name}
                                </span>
                                {org.isVerified && (
                                  <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground truncate block">
                                {org.admins?.length || 1} member
                                {org.admins?.length !== 1 && "s"}
                              </span>
                            </div>
                            {selectedOrgId === org._id && (
                              <CheckCircle className="h-5 w-5 text-indigo-500 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Form */}
              {selectedOrgId && (
                <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-3xl overflow-hidden shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-100/50 dark:border-green-900/30">
                    <div
                      className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <CardTitle
                          className={`text-2xl text-green-800 dark:text-green-200 ${isRTL ? "font-arabic" : ""
                            }`}
                        >
                          {t("approved.title")}
                        </CardTitle>
                        <CardDescription
                          className={`text-green-600 dark:text-green-300 text-lg ${isRTL ? "font-arabic" : ""
                            }`}
                        >
                          Publishing under{" "}
                          <strong>{selectedOrg?.name}</strong>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="md:p-8 p-2">
                    <div className="space-y-6">
                      <div className="glass bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30 rounded-2xl p-6">
                        <div
                          className={`flex items-center gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""
                            }`}
                        >
                          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h3
                            className={`font-semibold text-blue-800 dark:text-blue-200 ${isRTL ? "font-arabic" : ""
                              }`}
                          >
                            {t("approved.welcomeMessage")}
                          </h3>
                        </div>
                        <p
                          className={`text-muted-foreground ${isRTL ? "font-arabic text-right" : ""
                            }`}
                        >
                          {t("approved.description")}
                        </p>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                      {/* Event Form */}
                      <div className="space-y-4">
                        <div
                          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""
                            }`}
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <h3
                            className={`text-xl font-semibold ${isRTL ? "font-arabic" : ""
                              }`}
                          >
                            {t("approved.formTitle")}
                          </h3>
                        </div>
                        <EventForm
                          userId={user._id}
                          type="Create"
                          organisationId={selectedOrgId}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No org selected prompt */}
              {!selectedOrgId && organisations.length > 1 && (
                <div className="glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-8 text-center">
                  <Building2 className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Select an organisation above to start creating your event
                  </p>
                </div>
              )}
            </>
          )}

          {/* Loading state */}
          {orgsLoading && (
            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-3xl p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto" />
                <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-6">
            <h3
              className={`text-lg font-semibold mb-2 ${isRTL ? "font-arabic" : ""
                }`}
            >
              {t("help.title")}
            </h3>
            <p
              className={`text-muted-foreground mb-4 ${isRTL ? "font-arabic" : ""
                }`}
            >
              {t("help.description")}
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-3 justify-center ${isRTL ? "sm:flex-row-reverse" : ""
                }`}
            >
              <Button
                variant="outline"
                size="sm"
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic flex-row-reverse" : ""
                  }`}
                asChild
              >
                <Link href="/help">
                  {t("help.actions.helpCenter")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full ${isRTL ? "font-arabic flex-row-reverse" : ""
                  }`}
                asChild
              >
                <Link href="/support">
                  {t("help.actions.contactUs")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function CreateEventPageSkeleton({ isRTL }: { isRTL: boolean }) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 ${isRTL ? "rtl" : "ltr"
        }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div
            className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""
              }`}
          >
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 rounded-3xl p-8">
            <div className="space-y-6">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
