"use client";

import { SearchParamProps } from "@/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, Shapes, Users, Building2, Sparkles } from "lucide-react";

import UsersAdministration from "@/components/admin/UsersAdministration";
import ReportsAdminstration from "@/components/admin/ReportsAdminstration";
import React, { use } from "react";
import CategoryFilter from "@/components/shared/CategoryFilter";
import CategorieAdministration from "@/components/admin/CategorieAdministration";
import OrganisationsAdministration from "@/components/admin/OrganisationsAdministration";
import AIToolAdministration from "@/components/admin/AIToolAdministration";
import { useTranslations } from "next-intl";

const Orders = (props: SearchParamProps) => {
  const t = useTranslations("ownerDashboard");
  const searchParams = use(props.searchParams);
  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";
  const [value, setValue] = React.useState("users");
  const RenderComponent = () => {
    switch (value) {
      case "users":
        return <UsersAdministration />;
      case "reports":
        return <ReportsAdminstration />;
      case "categories":
        return <CategorieAdministration />;
      case "organisations":
        return <OrganisationsAdministration />;
      case "aitools":
        return <AIToolAdministration />;
      default:
        return <UsersAdministration />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl rounded-2xl min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {t("title")}
      </h1>

      <Tabs
        defaultValue="users"
        className="w-full !rounded-full"
        onValueChange={(value) => setValue(value)}
      >
        <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6 rounded-full">
          <TabsTrigger
            value="users"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("tabs.users")}</span>
            <span className="sm:hidden">{t("tabs.usersShort")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="organisations"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("tabs.organisations")}</span>
            <span className="sm:hidden">{t("tabs.organisationsShort")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("tabs.reports")}</span>
            <span className="sm:hidden">{t("tabs.reportsShort")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Shapes className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("tabs.categories")}</span>
            <span className="sm:hidden">{t("tabs.categoriesShort")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="aitools"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("tabs.aiTools")}</span>
            <span className="sm:hidden">{t("tabs.aiToolsShort")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex1 w-full mt-4">
        <RenderComponent />
      </div>
    </div>
  );
};


export default Orders;
