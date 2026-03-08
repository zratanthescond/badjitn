import { getEventsByUser } from "@/lib/actions/event.actions";
import { getOrdersByUser } from "@/lib/actions/order.actions";
import { useUser } from "@/lib/actions/user.actions";
import { getOrganisationsByUser } from "@/lib/actions/organisation.actions";
import { IOrder } from "@/lib/database/models/order.model";
import { SearchParamProps } from "@/types";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import ProfileDashboard from "@/components/shared/ProfileDashboard";

export const dynamic = "force-dynamic";

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const user = await useUser();
  if (!user) {
    return redirect("/sign-in");
  }
  const userId = user?._id;
  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });
  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });
  const organisations = await getOrganisationsByUser(userId) || [];
  const t = await getTranslations("profile");

  // Pre-resolve all translation strings to pass as plain data
  const translations = {
    myTickets: t("myTickets"),
    exploreMoreEvents: t("exploreMoreEvents"),
    emptyTicketsTitle: t("emptyTickets.title"),
    emptyTicketsDescription: t("emptyTickets.description"),
    eventsOrganized: t("eventsOrganized"),
    createNewEvent: t("createNewEvent"),
    emptyEventsCreatedTitle: t("emptyEventsCreated.title"),
    emptyEventsCreatedDescription: t("emptyEventsCreated.description"),
    mySponsors: t("mySponsors"),
    addSponsor: t("addSponsor"),
    customRequiredInfo: t("customRequiredInfo"),
    addCustomRequiredInfo: t("addCustomRequiredInfo"),
    profileSettings: t("settings.title"),
    profileSettingsDescription: t("settings.description"),
    saveProfile: t("settings.saveProfile"),
    saving: t("settings.saving"),
    fields: {
      firstName: t("settings.fields.firstName"),
      lastName: t("settings.fields.lastName"),
      jobTitle: t("settings.fields.jobTitle"),
      republic: t("settings.fields.republic"),
      city: t("settings.fields.city"),
      village: t("settings.fields.village"),
    },
    profileUpdatedTitle: t("settings.messages.updatedTitle"),
    profileUpdatedDescription: t("settings.messages.updatedDescription"),
    profileUpdateErrorTitle: t("settings.messages.errorTitle"),
    profileUpdateErrorDescription: t("settings.messages.errorDescription"),
    worldExceptIsrael: t("settings.worldExceptIsrael"),
    countryPlaceholder: t("settings.countryPlaceholder"),
    cityPlaceholder: t("settings.cityPlaceholder"),
    cityNoOptions: t("settings.cityNoOptions"),
    citySearchPlaceholder: t("settings.citySearchPlaceholder"),
    cityNoMatch: t("settings.cityNoMatch"),
  };

  return (
    <ProfileDashboard
      userId={userId.toString()}
      user={JSON.parse(JSON.stringify(user))}
      orderedEvents={orderedEvents}
      ordersPage={ordersPage}
      ordersTotalPages={orders?.totalPages || 1}
      organizedEvents={organizedEvents?.data || []}
      eventsPage={eventsPage}
      eventsTotalPages={organizedEvents?.totalPages || 1}
      organisations={organisations}
      translations={translations}
    />
  );
};

export default ProfilePage;
