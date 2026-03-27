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

const ProfilePage = async (props: SearchParamProps) => {
  const searchParams = await props.searchParams;
  const user = await useUser();
  if (!user) {
    // return redirect("/sign-in");
  }
  const userId = user?._id;
  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  const [orders, organizedEvents, organisations, t, tCard] = await Promise.all([
    getOrdersByUser({ userId, page: ordersPage }),
    getEventsByUser({ userId, page: eventsPage }),
    getOrganisationsByUser(userId),
    getTranslations("profile"),
    getTranslations("organisationCard"),
  ]);
  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];

  // Pre-resolve all translation strings to pass as plain data
  const translations = {
    myTickets: t("myTickets"),
    exploreMoreEvents: t("exploreMoreEvents"),
    emptyTickets: {
      title: t("emptyTickets.title"),
      description: t("emptyTickets.description"),
    },
    eventsOrganized: t("eventsOrganized"),
    createNewEvent: t("createNewEvent"),
    eventsTabDescription: t("eventsTabDescription"),
    emptyEventsCreated: {
      title: t("emptyEventsCreated.title"),
      description: t("emptyEventsCreated.description"),
    },
    mySponsors: t("mySponsors"),
    sponsorsDescription: t("sponsorsDescription"),
    addSponsor: t("addSponsor"),
    emptySponsors: {
      title: t("emptySponsors.title"),
      description: t("emptySponsors.description"),
    },
    customRequiredInfo: t("customRequiredInfo"),
    customFieldsDescription: t("customFieldsDescription"),
    addCustomRequiredInfo: t("addCustomRequiredInfo"),
    settings: {
      title: t("settings.title"),
      description: t("settings.description"),
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
      cityPlaceholder: t("settings.cityPlaceholder"),
      cityNoOptions: t("settings.cityNoOptions"),
      citySearchPlaceholder: t("settings.citySearchPlaceholder"),
      cityNoMatch: t("settings.cityNoMatch"),
      worldExceptIsrael: t("settings.worldExceptIsrael"),
      countryPlaceholder: t("settings.countryPlaceholder"),
      messages: {
        updatedTitle: t("settings.messages.updatedTitle"),
        updatedDescription: t("settings.messages.updatedDescription"),
        errorTitle: t("settings.messages.errorTitle"),
        errorDescription: t("settings.messages.errorDescription"),
        deleteSponsorSuccess: t("settings.messages.deleteSponsorSuccess"),
        deleteSponsorError: t("settings.messages.deleteSponsorError"),
      },
    },
    editSponsor: t("editSponsor"),
    deleteSponsor: t("deleteSponsor"),
    deleteSponsorConfirm: t("deleteSponsorConfirm"),
    dashboard: t("dashboard"),
    welcomeBack: t("welcomeBack", { name: user.firstName }),
    stats: {
      tickets: t("stats.tickets"),
      events: t("stats.events"),
      organisations: t("stats.organisations"),
      verifiedOrgs: t("stats.verifiedOrgs"),
    },
    quickActions: {
      title: t("quickActions.title"),
      createEvent: t("quickActions.createEvent"),
      newOrganisation: t("quickActions.newOrganisation"),
      viewTickets: t("quickActions.viewTickets"),
    },
    recentEvents: {
      title: t("recentEvents.title"),
      viewAll: t("recentEvents.viewAll"),
    },
    myOrganisations: {
      title: t("myOrganisations.title"),
      description: t("myOrganisations.description"),
      viewAll: t("myOrganisations.viewAll"),
      empty: {
        title: t("myOrganisations.empty.title"),
        description: t("myOrganisations.empty.description"),
        button: t("myOrganisations.empty.button"),
      },
      verification: {
        title: t("myOrganisations.verification.title"),
        description: t("myOrganisations.verification.description"),
      },
    },
    forms: {
      title: t("forms.title"),
      description: t("forms.description"),
      createButton: t("forms.createButton"),
      info: {
        title: t("forms.info.title"),
        description: t("forms.info.description"),
      },
      status: {
        active: t("forms.status.active"),
        inactive: t("forms.status.inactive"),
        fields: t("forms.status.fields"),
        invited: t("forms.status.invited"),
      },
      actions: {
        edit: t("forms.actions.edit"),
        open: t("forms.actions.open"),
      },
      empty: {
        title: t("forms.empty.title"),
        description: t("forms.empty.description"),
        button: t("forms.empty.button"),
      },
      deleteConfirm: t("forms.deleteConfirm"),
      messages: {
        deletedTitle: t("forms.messages.deletedTitle"),
        deletedDescription: t("forms.messages.deletedDescription"),
        errorTitle: t("forms.messages.errorTitle"),
      },
    },
    sidebar: {
      overview: t("sidebar.overview"),
      profileSettings: t("sidebar.profileSettings"),
      myTickets: t("sidebar.myTickets"),
      eventsOrganized: t("sidebar.eventsOrganized"),
      organisations: t("sidebar.organisations"),
      customForms: t("sidebar.customForms"),
      sponsors: t("sidebar.sponsors"),
      customFields: t("sidebar.customFields"),
    },
    organisationCard: {
      noDescription: tCard("noDescription"),
      member: tCard("member"),
      members: tCard("members"),
      owner: tCard("owner"),
      admin: tCard("admin"),
    },
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
