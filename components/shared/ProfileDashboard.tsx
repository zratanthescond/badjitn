"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Ticket,
    CalendarDays,
    Building2,
    Megaphone,
    ClipboardList,
    Plus,
    ChevronRight,
    CalendarPlus,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Collection from "@/components/shared/Collection";
import SponsorForm from "@/components/shared/AddSponsorComponenet";
import HexGridSponsor from "@/components/shared/HexSponsor";
import FormBuilder from "@/components/shared/FormBuilder";
import FieldViewer from "@/components/shared/FieldViewer";
import OrganisationCard from "@/components/shared/OrganisationCard";

type TabKey = "overview" | "tickets" | "events" | "organisations" | "sponsors" | "fields";

interface TranslationStrings {
    myTickets: string;
    exploreMoreEvents: string;
    emptyTicketsTitle: string;
    emptyTicketsDescription: string;
    eventsOrganized: string;
    createNewEvent: string;
    emptyEventsCreatedTitle: string;
    emptyEventsCreatedDescription: string;
    mySponsors: string;
    addSponsor: string;
    customRequiredInfo: string;
    addCustomRequiredInfo: string;
}

interface ProfileDashboardProps {
    userId: string;
    user: any;
    orderedEvents: any[];
    ordersPage: number;
    ordersTotalPages: number;
    organizedEvents: any[];
    eventsPage: number;
    eventsTotalPages: number;
    organisations: any[];
    translations: TranslationStrings;
}

const sidebarItems: { key: TabKey; icon: any; labelKey: string }[] = [
    { key: "overview", icon: LayoutDashboard, labelKey: "Overview" },
    { key: "tickets", icon: Ticket, labelKey: "My Tickets" },
    { key: "events", icon: CalendarDays, labelKey: "Events Organized" },
    { key: "organisations", icon: Building2, labelKey: "Organisations" },
    { key: "sponsors", icon: Megaphone, labelKey: "Sponsors" },
    { key: "fields", icon: ClipboardList, labelKey: "Custom Fields" },
];

export default function ProfileDashboard({
    userId,
    user,
    orderedEvents,
    ordersPage,
    ordersTotalPages,
    organizedEvents,
    eventsPage,
    eventsTotalPages,
    organisations,
    translations,
}: ProfileDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-purple-950/10">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-[260px] min-h-[calc(100vh-5rem)] sticky top-20 border-r border-border/40 bg-background/80 backdrop-blur-xl p-4 gap-1">
                    {/* User info */}
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/30 dark:border-indigo-700/30">
                        {user?.photo ? (
                            <img
                                src={user.photo}
                                alt={user.firstName}
                                className="w-10 h-10 rounded-full border-2 border-white/50 dark:border-slate-700/50 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${isActive
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span>{item.labelKey}</span>
                                    {item.key === "organisations" && organisations.length > 0 && (
                                        <span
                                            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                }`}
                                        >
                                            {organisations.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Tab Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 px-2 py-1.5">
                    <div className="flex justify-around">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-all ${isActive
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Welcome back, {user?.firstName}! Here&apos;s your overview.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    icon={Ticket}
                                    label="Tickets"
                                    value={orderedEvents.length}
                                    color="from-blue-500 to-cyan-500"
                                    onClick={() => setActiveTab("tickets")}
                                />
                                <StatCard
                                    icon={CalendarDays}
                                    label="Events"
                                    value={organizedEvents.length}
                                    color="from-emerald-500 to-teal-500"
                                    onClick={() => setActiveTab("events")}
                                />
                                <StatCard
                                    icon={Building2}
                                    label="Organisations"
                                    value={organisations.length}
                                    color="from-indigo-500 to-purple-500"
                                    onClick={() => setActiveTab("organisations")}
                                />
                                <StatCard
                                    icon={CheckCircle}
                                    label="Verified Orgs"
                                    value={organisations.filter((o: any) => o.isVerified).length}
                                    color="from-amber-500 to-orange-500"
                                    onClick={() => setActiveTab("organisations")}
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 text-indigo-500" />
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Link
                                        href="/events/create"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                            <CalendarPlus className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            Create Event
                                        </span>
                                    </Link>
                                    <Link
                                        href="/organisations/create"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            New Organisation
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => setActiveTab("tickets")}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group text-left"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                            <Ticket className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            View Tickets
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Events Preview */}
                            {organizedEvents.length > 0 && (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-indigo-500" />
                                            Recent Events
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab("events")}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            View all <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <Collection
                                        data={organizedEvents.slice(0, 3)}
                                        emptyTitle=""
                                        emptyStateSubtext=""
                                        collectionType="Events_Organized"
                                        limit={3}
                                        page={1}
                                        totalPages={1}
                                    />
                                </div>
                            )}

                            {/* Organisations Preview */}
                            {organisations.length > 0 && (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-indigo-500" />
                                            My Organisations
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab("organisations")}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            View all <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {organisations.slice(0, 2).map((org: any) => (
                                            <OrganisationCard
                                                key={org._id}
                                                organisation={org}
                                                isCreator={org.creator?._id === userId}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tickets Tab */}
                    {activeTab === "tickets" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.myTickets}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        All your purchased event tickets
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="rounded-full">
                                    <Link href="/#events">{translations.exploreMoreEvents}</Link>
                                </Button>
                            </div>
                            <Collection
                                data={orderedEvents}
                                emptyTitle={translations.emptyTicketsTitle}
                                emptyStateSubtext={translations.emptyTicketsDescription}
                                collectionType="My_Tickets"
                                limit={3}
                                page={ordersPage}
                                urlParamName="ordersPage"
                                totalPages={ordersTotalPages}
                            />
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === "events" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.eventsOrganized}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Events you&apos;ve created and organized
                                    </p>
                                </div>
                                <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 rounded-full">
                                    <Link href="/events/create">
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        {translations.createNewEvent}
                                    </Link>
                                </Button>
                            </div>
                            <Collection
                                data={organizedEvents}
                                emptyTitle={translations.emptyEventsCreatedTitle}
                                emptyStateSubtext={translations.emptyEventsCreatedDescription}
                                collectionType="Events_Organized"
                                limit={3}
                                page={eventsPage}
                                urlParamName="eventsPage"
                                totalPages={eventsTotalPages}
                            />
                        </div>
                    )}

                    {/* Organisations Tab */}
                    {activeTab === "organisations" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">My Organisations</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Manage your organisations and their events
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full"
                                >
                                    <Link href="/organisations/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Organisation
                                    </Link>
                                </Button>
                            </div>

                            {/* Organisation Verification Info */}
                            <div className="glass bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-md border border-blue-200/30 dark:border-blue-700/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Organisation Verification</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Verified organisations can publish events with a trusted badge. Verification is approved by the platform admin.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Organisations List */}
                            {organisations && organisations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {organisations.map((org: any) => (
                                        <OrganisationCard
                                            key={org._id}
                                            organisation={org}
                                            isCreator={org.creator?._id === userId}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                            <Building2 className="h-10 w-10 text-indigo-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            No organisations yet
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            Create your first organisation to start publishing events
                                            and build your community.
                                        </p>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                                        >
                                            <Link href="/organisations/create">
                                                <Plus className="h-5 w-5 mr-2" />
                                                Create Organisation
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sponsors Tab */}
                    {activeTab === "sponsors" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.mySponsors}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Manage your event sponsors
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {translations.addSponsor}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="min-w-full bg-card">
                                        <ScrollArea className="h-[500px] w-full">
                                            <SponsorForm userId={userId} />
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <HexGridSponsor userId={userId} />
                        </div>
                    )}

                    {/* Custom Fields Tab */}
                    {activeTab === "fields" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.customRequiredInfo}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        Custom fields required for event registration
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {translations.addCustomRequiredInfo}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="min-w-full bg-card">
                                        <FormBuilder userId={userId} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <FieldViewer userId={userId} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

/* ===== Stat Card Sub-component ===== */
function StatCard({
    icon: Icon,
    label,
    value,
    color,
    onClick,
}: {
    icon: any;
    label: string;
    value: number | string;
    color: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 text-left hover:scale-[1.03] transition-all duration-200 hover:shadow-lg group w-full"
        >
            <div className={`p-2 rounded-xl bg-gradient-to-r ${color} text-white w-fit mb-3`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </button>
    );
}
