import Search from "@/components/shared/Search";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { SearchParamProps } from "@/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Briefcase,
  FileText,
  Flag,
  Shapes,
  Ticket,
  User2Icon,
  Users,
} from "lucide-react";
import CertificationAdministration from "@/components/admin/certification-administration";
import OrderAdministration from "@/components/admin/order-administration";
import WorkAdministration from "@/components/admin/work-administration";
import UsersAdministration from "@/components/admin/UsersAdministration";
import ReportsAdminstration from "@/components/admin/ReportsAdminstration";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const eventId = (searchParams?.eventId as string) || "";
  const searchText = (searchParams?.query as string) || "";

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl rounded-2xl min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Owner Dashboard
      </h1>

      <Tabs defaultValue="users" className="w-full !rounded-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6  rounded-full">
          <TabsTrigger
            value="users"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users administration</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Flag className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Reports Administration</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-card rounded-full"
          >
            <Shapes className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Categories Administration</span>
            <span className="sm:hidden">Categories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="rounded-3xl">
          <UsersAdministration />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsAdminstration />
        </TabsContent>

        <TabsContent value="categories"></TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
