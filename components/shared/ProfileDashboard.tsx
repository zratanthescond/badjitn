"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Check,
    ChevronsUpDown,
    FileText,
    ExternalLink,
    Users,
    Loader2,
    Pencil,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Collection from "@/components/shared/Collection";
import SponsorForm from "@/components/shared/SponsorForm";
import { getSponsors, deleteSponsor } from "@/lib/actions/sponsor.action";
import FormBuilder from "@/components/shared/FormBuilder";
import FieldViewer from "@/components/shared/FieldViewer";
import OrganisationCard from "@/components/shared/OrganisationCard";
import { toast } from "@/hooks/use-toast";
import { updateCurrentUserProfile } from "@/lib/actions/user.actions";
import { CountryDropdown, Country } from "@/components/ui/country-dropdown";
import { countries, timezones } from "country-data-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { countryGovernorates } from "@/constants/country-governorates";
import EventFormBuilder from "@/components/shared/EventFormBuilder";
import InviteDialog from "@/components/shared/InviteDialog";
import { getFormsByCreator, deleteEventForm } from "@/lib/actions/eventform.actions";

type TabKey = "overview" | "profileSettings" | "tickets" | "events" | "organisations" | "sponsors" | "fields" | "forms";

interface TranslationStrings {
    myTickets: string;
    exploreMoreEvents: string;
    emptyTickets: {
        title: string;
        description: string;
    };
    eventsOrganized: string;
    eventsTabDescription: string;
    createNewEvent: string;
    emptyEventsCreated: {
        title: string;
        description: string;
    };
    emptySponsors: {
        title: string;
        description: string;
    };
    mySponsors: string;
    sponsorsDescription: string;
    addSponsor: string;
    customRequiredInfo: string;
    customFieldsDescription: string;
    addCustomRequiredInfo: string;
    settings: {
        title: string;
        description: string;
        saveProfile: string;
        saving: string;
        fields: {
            firstName: string;
            lastName: string;
            jobTitle: string;
            republic: string;
            city: string;
            village: string;
        };
        messages: {
            updatedTitle: string;
            updatedDescription: string;
            errorTitle: string;
            errorDescription: string;
            deleteSponsorSuccess: string;
            deleteSponsorError: string;
        };
        worldExceptIsrael: string;
        countryPlaceholder: string;
        cityPlaceholder: string;
        cityNoOptions: string;
        citySearchPlaceholder: string;
        cityNoMatch: string;
    };
    editSponsor: string;
    deleteSponsor: string;
    deleteSponsorConfirm: string;
    dashboard: string;
    welcomeBack: string;
    stats: {
        tickets: string;
        events: string;
        organisations: string;
        verifiedOrgs: string;
    };
    quickActions: {
        title: string;
        createEvent: string;
        newOrganisation: string;
        viewTickets: string;
    };
    recentEvents: {
        title: string;
        viewAll: string;
    };
    myOrganisations: {
        title: string;
        description: string;
        viewAll: string;
        empty: {
            title: string;
            description: string;
            button: string;
        };
        verification: {
            title: string;
            description: string;
        };
    };
    forms: {
        title: string;
        description: string;
        createButton: string;
        info: {
            title: string;
            description: string;
        };
        status: {
            active: string;
            inactive: string;
            fields: string;
            invited: string;
        };
        actions: {
            edit: string;
            open: string;
        };
        empty: {
            title: string;
            description: string;
            button: string;
        };
        deleteConfirm: string;
        messages: {
            deletedTitle: string;
            deletedDescription: string;
            errorTitle: string;
        };
    };
    sidebar: {
        overview: string;
        profileSettings: string;
        myTickets: string;
        eventsOrganized: string;
        organisations: string;
        customForms: string;
        sponsors: string;
        customFields: string;
    };
    organisationCard: {
        noDescription: string;
        member: string;
        members: string;
        owner: string;
        admin: string;
    };
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
    const sidebarItems: { key: TabKey; icon: any; label: string }[] = [
        { key: "overview", icon: LayoutDashboard, label: translations.sidebar.overview },
        { key: "profileSettings", icon: CheckCircle, label: translations.sidebar.profileSettings },
        { key: "tickets", icon: Ticket, label: translations.sidebar.myTickets },
        { key: "events", icon: CalendarDays, label: translations.sidebar.eventsOrganized },
        { key: "organisations", icon: Building2, label: translations.sidebar.organisations },
        { key: "forms", icon: FileText, label: translations.sidebar.customForms },
        { key: "sponsors", icon: Megaphone, label: translations.sidebar.sponsors },
        { key: "fields", icon: ClipboardList, label: translations.sidebar.customFields },
    ];
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    // Sync active tab with URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") as TabKey;
        if (tab && sidebarItems.some(item => item.key === tab)) {
            setActiveTab(tab);
        }
    }, []);

    const handleTabChange = (key: TabKey) => {
        setActiveTab(key);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", key);
        window.history.replaceState({}, "", url);
    };
    const [cityOpen, setCityOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        jobTitle: user?.jobTitle || "",
        republic: user?.republic || "",
        city: user?.city || "",
        village: user?.village || "",
    });
    const allowedCountries = countries.all.filter(
        (country) =>
            country.emoji &&
            country.status !== "deleted" &&
            country.ioc !== "PRK" &&
            country.alpha2 !== "IL"
    );
    const selectedCountry = allowedCountries.find(
        (country) => country.alpha3 === profileForm.republic
    );
    const cityOptions = useMemo(() => {
        if (!selectedCountry) return [];

        const governorates = countryGovernorates[selectedCountry.alpha3];
        if (governorates && governorates.length > 0) {
            return [...governorates].sort((a, b) => a.localeCompare(b));
        }

        return (timezones.getTimezonesByCountry(selectedCountry.alpha2) || [])
            .map((tz) => tz.split("/").pop() || tz)
            .map((city) => city.replace(/_/g, " "))
            .filter((city, index, arr) => arr.indexOf(city) === index)
            .sort((a, b) => a.localeCompare(b));
    }, [selectedCountry]);
    const cityOptionsWithCurrent =
        profileForm.city && !cityOptions.includes(profileForm.city)
            ? [profileForm.city, ...cityOptions]
            : cityOptions;

    const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await updateCurrentUserProfile(profileForm);
            toast({
                title: translations.settings.messages.updatedTitle,
                description: translations.settings.messages.updatedDescription,
            });
            router.refresh();
        } catch {
            toast({
                title: translations.settings.messages.errorTitle,
                description: translations.settings.messages.errorDescription,
                variant: "destructive",
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const [userForms, setUserForms] = useState<any[]>([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const [editingForm, setEditingForm] = useState<any | null>(null);
    const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

    const handleDeleteForm = async (formId: string) => {
        if (!confirm(translations.forms.deleteConfirm)) return;
        setDeletingFormId(formId);
        const result = await deleteEventForm(formId);
        if (result.success) {
            setUserForms((prev) => prev.filter((f) => f._id !== formId));
            toast({
                title: translations.forms.messages.deletedTitle,
                description: translations.forms.messages.deletedDescription,
            });
        } else {
            toast({
                title: translations.forms.messages.errorTitle,
                description: result.message,
                variant: "destructive",
            });
        }
        setDeletingFormId(null);
    };

    const loadForms = () => {
        setFormsLoading(true);
        getFormsByCreator(userId).then((result) => {
            if (result.success) {
                setUserForms(result.data);
            }
            setFormsLoading(false);
        });
    };

    const [userSponsors, setUserSponsors] = useState<any[]>([]);
    const [sponsorsLoading, setSponsorsLoading] = useState(false);
    const [showSponsorForm, setShowSponsorForm] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<any | null>(null);
    const [deletingSponsorId, setDeletingSponsorId] = useState<string | null>(null);

    const loadSponsors = () => {
        setSponsorsLoading(true);
        getSponsors(null, userId).then((result) => {
            if (result.success) {
                setUserSponsors(result.data);
            }
            setSponsorsLoading(false);
        });
    };

    const handleDeleteSponsor = async (sponsorId: string) => {
        setDeletingSponsorId(sponsorId);
        const result = await deleteSponsor({ userId, sponsorId });
        if (result.success) {
            setUserSponsors((prev) => prev.filter((s) => s._id !== sponsorId));
            toast({
                title: translations.settings.messages.deleteSponsorSuccess,
            });
        } else {
            toast({
                title: translations.settings.messages.deleteSponsorError,
                description: (result as any).error || "Failed to delete sponsor",
                variant: "destructive",
            });
        }
        setDeletingSponsorId(null);
    };

    // Load forms or sponsors when tab is activated
    useEffect(() => {
        if (activeTab === "forms") {
            loadForms();
        } else if (activeTab === "sponsors") {
            loadSponsors();
        }
    }, [activeTab, userId]);

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
                                    <span>{item.label}</span>
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
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 px-2 py-1.5 overflow-hidden">
                    <ScrollArea className="w-full">
                        <div className="flex items-center gap-1 min-w-max px-2 py-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => handleTabChange(item.key)}
                                        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs transition-all min-w-[72px] ${isActive
                                            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                                        <span className="text-[10px] leading-none">{item.label.split(" ")[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <ScrollBar orientation="horizontal" className="invisible" />
                    </ScrollArea>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {translations.dashboard}
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    {translations.welcomeBack.replace("{name}", user?.firstName || "")}
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    icon={Ticket}
                                    label={translations.stats.tickets}
                                    value={orderedEvents.length}
                                    color="from-blue-500 to-cyan-500"
                                    onClick={() => setActiveTab("tickets")}
                                />
                                <StatCard
                                    icon={CalendarDays}
                                    label={translations.stats.events}
                                    value={organizedEvents.length}
                                    color="from-emerald-500 to-teal-500"
                                    onClick={() => setActiveTab("events")}
                                />
                                <StatCard
                                    icon={Building2}
                                    label={translations.stats.organisations}
                                    value={organisations.length}
                                    color="from-indigo-500 to-purple-500"
                                    onClick={() => setActiveTab("organisations")}
                                />
                                <StatCard
                                    icon={CheckCircle}
                                    label={translations.stats.verifiedOrgs}
                                    value={organisations.filter((o: any) => o.isVerified).length}
                                    color="from-amber-500 to-orange-500"
                                    onClick={() => setActiveTab("organisations")}
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 text-indigo-500" />
                                    {translations.quickActions.title}
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
                                            {translations.quickActions.createEvent}
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
                                            {translations.quickActions.newOrganisation}
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
                                            {translations.quickActions.viewTickets}
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
                                            {translations.recentEvents.title}
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab("events")}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {translations.recentEvents.viewAll} <ChevronRight className="h-3 w-3" />
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
                                        currentUserId={userId}
                                    />
                                </div>
                            )}

                            {/* Organisations Preview */}
                            {organisations.length > 0 && (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-indigo-500" />
                                            {translations.myOrganisations.title}
                                        </h3>
                                        <button
                                            onClick={() => setActiveTab("organisations")}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            {translations.myOrganisations.viewAll} <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {organisations.slice(0, 2).map((org: any) => (
                                            <OrganisationCard
                                                key={org._id}
                                                organisation={org}
                                                isCreator={org.creator?._id === userId}
                                                translations={translations.organisationCard}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tickets Tab */}
                    {activeTab === "profileSettings" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{translations.settings.title}</h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {translations.settings.description}
                                </p>
                            </div>

                            <form
                                onSubmit={handleProfileSubmit}
                                className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-5 space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{translations.settings.fields.firstName}</Label>
                                        <Input
                                            id="firstName"
                                            value={profileForm.firstName}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{translations.settings.fields.lastName}</Label>
                                        <Input
                                            id="lastName"
                                            value={profileForm.lastName}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="jobTitle">{translations.settings.fields.jobTitle}</Label>
                                        <Input
                                            id="jobTitle"
                                            value={profileForm.jobTitle}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({ ...prev, jobTitle: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>{translations.settings.fields.republic}</Label>
                                        <CountryDropdown
                                            options={allowedCountries as Country[]}
                                            defaultValue={profileForm.republic}
                                            placeholder={translations.settings.countryPlaceholder}
                                            onChange={(country) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    republic: country.alpha3,
                                                    city: "",
                                                }))
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {translations.settings.worldExceptIsrael}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{translations.settings.fields.city}</Label>
                                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="city"
                                                    type="button"
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={cityOpen}
                                                    disabled={!profileForm.republic || cityOptionsWithCurrent.length === 0}
                                                    className="w-full justify-between font-normal"
                                                >
                                                    <span className="truncate text-left">
                                                        {profileForm.city || translations.settings.cityPlaceholder}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder={translations.settings.citySearchPlaceholder} />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {cityOptionsWithCurrent.length === 0
                                                                ? translations.settings.cityNoOptions
                                                                : translations.settings.cityNoMatch}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {cityOptionsWithCurrent.map((city) => (
                                                                <CommandItem
                                                                    key={city}
                                                                    value={city}
                                                                    onSelect={() => {
                                                                        setProfileForm((prev) => ({ ...prev, city }));
                                                                        setCityOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            profileForm.city === city ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {city}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="village">{translations.settings.fields.village}</Label>
                                        <Input
                                            id="village"
                                            value={profileForm.village}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({ ...prev, village: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full"
                                    disabled={isSavingProfile}
                                >
                                    {isSavingProfile ? translations.settings.saving : translations.settings.saveProfile}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Tickets Tab */}
                    {activeTab === "tickets" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.myTickets}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.exploreMoreEvents}
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="rounded-full w-full sm:w-auto">
                                    <Link href="/#events">{translations.exploreMoreEvents}</Link>
                                </Button>
                            </div>
                            <Collection
                                data={orderedEvents}
                                emptyTitle={translations.emptyTickets.title}
                                emptyStateSubtext={translations.emptyTickets.description}
                                collectionType="My_Tickets"
                                limit={3}
                                page={ordersPage}
                                urlParamName="ordersPage"
                                currentUserId={userId}
                                totalPages={ordersTotalPages}
                            />
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === "events" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.eventsOrganized}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.eventsTabDescription}
                                    </p>
                                </div>
                                <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 rounded-full w-full sm:w-auto">
                                    <Link href="/events/create">
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        {translations.createNewEvent}
                                    </Link>
                                </Button>
                            </div>
                            <Collection
                                data={organizedEvents}
                                emptyTitle={translations.emptyEventsCreated.title}
                                emptyStateSubtext={translations.emptyEventsCreated.description}
                                collectionType="Events_Organized"
                                limit={3}
                                page={eventsPage}
                                urlParamName="eventsPage"
                                currentUserId={userId}
                                totalPages={eventsTotalPages}
                            />
                        </div>
                    )}

                    {/* Organisations Tab */}
                    {activeTab === "organisations" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.myOrganisations.title}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.myOrganisations.description}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full w-full sm:w-auto"
                                >
                                    <Link href="/organisations/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {translations.quickActions.newOrganisation}
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
                                        <h3 className="font-semibold text-sm">{translations.myOrganisations.verification.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {translations.myOrganisations.verification.description}
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
                                            translations={translations.organisationCard}
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
                                            {translations.myOrganisations.empty.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {translations.myOrganisations.empty.description}
                                        </p>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                                        >
                                            <Link href="/organisations/create">
                                                <Plus className="h-5 w-5 mr-2" />
                                                {translations.myOrganisations.empty.button}
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.mySponsors}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.sponsorsDescription}
                                    </p>
                                </div>
                                <Dialog open={showSponsorForm} onOpenChange={(open) => { setShowSponsorForm(open); if (!open) setEditingSponsor(null); }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full w-full sm:w-auto">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {translations.addSponsor}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl p-0 bg-card">
                                        <DialogTitle className="sr-only">
                                            {editingSponsor ? translations.editSponsor : translations.addSponsor}
                                        </DialogTitle>
                                        <ScrollArea className="max-h-[85vh] p-6">
                                            <SponsorForm
                                                userId={userId}
                                                initialData={editingSponsor}
                                                onSuccess={() => {
                                                    setShowSponsorForm(false);
                                                    setEditingSponsor(null);
                                                    loadSponsors();
                                                }}
                                            />
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {sponsorsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : userSponsors.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userSponsors.map((sponsor: any) => (
                                        <Card
                                            key={sponsor._id}
                                            className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-16 h-16 rounded-xl bg-white p-2 border border-border/40 shrink-0 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={sponsor.logo}
                                                            alt={sponsor.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold truncate">{sponsor.name}</h3>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                                {sponsor.tier}
                                                            </Badge>
                                                            <Link
                                                                href={sponsor.website}
                                                                target="_blank"
                                                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                {sponsor.website.replace(/^https?:\/\//, "")}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full text-xs"
                                                            onClick={() => {
                                                                setEditingSponsor(sponsor);
                                                                setShowSponsorForm(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-3 w-3 mr-1" />
                                                            {translations.forms.actions.edit}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            disabled={deletingSponsorId === sponsor._id}
                                                            onClick={() => {
                                                                if (window.confirm(translations.deleteSponsorConfirm)) {
                                                                    handleDeleteSponsor(sponsor._id);
                                                                }
                                                            }}
                                                        >
                                                            {deletingSponsorId === sponsor._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                    {translations.deleteSponsor}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                            <Megaphone className="h-10 w-10 text-indigo-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{translations.emptySponsors.title}</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {translations.emptySponsors.description}
                                        </p>
                                        <Button
                                            onClick={() => setShowSponsorForm(true)}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            {translations.addSponsor}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Forms Tab */}
                    {activeTab === "forms" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.forms.title}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.forms.description}
                                    </p>
                                </div>
                                <Dialog open={showFormBuilder} onOpenChange={(open) => { setShowFormBuilder(open); if (!open) setEditingForm(null); }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full w-full sm:w-auto">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {translations.forms.createButton}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-card" onInteractOutside={(e) => e.preventDefault()}>
                                        <DialogTitle className="sr-only">
                                            {editingForm ? "Edit Custom Event Form" : "Create Custom Event Form"}
                                        </DialogTitle>
                                        <ScrollArea className="max-h-[85vh] p-6">
                                            <EventFormBuilder
                                                userId={userId}
                                                organisations={organisations}
                                                editForm={editingForm || undefined}
                                                onFormCreated={() => {
                                                    setShowFormBuilder(false);
                                                    setEditingForm(null);
                                                    loadForms();
                                                }}
                                                onFormUpdated={() => {
                                                    setShowFormBuilder(false);
                                                    setEditingForm(null);
                                                    loadForms();
                                                }}
                                            />
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Info banner */}
                            <div className="glass bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-md border border-indigo-200/30 dark:border-indigo-700/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{translations.forms.info.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {translations.forms.info.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {formsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : userForms.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {userForms.map((form: any) => (
                                        <Card
                                            key={form._id}
                                            className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 shrink-0">
                                                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold truncate">{form.title}</h3>
                                                        {form.description && (
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                                {form.description}
                                                            </p>
                                                        )}
                                                        {form.organisation && (
                                                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {form.organisation.name}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <Badge
                                                                variant={form.isActive ? "default" : "secondary"}
                                                                className={form.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
                                                            >
                                                                {form.isActive ? translations.forms.status.active : translations.forms.status.inactive}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {form.fields?.length || 0} {translations.forms.status.fields}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {form.invitedEmails?.length || 0} {translations.forms.status.invited}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full text-xs"
                                                            onClick={() => {
                                                                setEditingForm(form);
                                                                setShowFormBuilder(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-3 w-3 mr-1" />
                                                            {translations.forms.actions.edit}
                                                        </Button>
                                                        <InviteDialog
                                                            formId={form._id}
                                                            formTitle={form.title}
                                                            formSlug={form.slug}
                                                            onInvited={loadForms}
                                                        />
                                                        <Link href={`/forms/${form.slug}`} target="_blank">
                                                            <Button variant="outline" size="sm" className="rounded-full text-xs">
                                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                                {translations.forms.actions.open}
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            disabled={deletingFormId === form._id}
                                                            onClick={() => handleDeleteForm(form._id)}
                                                        >
                                                            {deletingFormId === form._id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                                            <FileText className="h-10 w-10 text-indigo-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{translations.forms.empty.title}</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {translations.forms.empty.description}
                                        </p>
                                        <Button
                                            onClick={() => setShowFormBuilder(true)}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            {translations.forms.empty.button}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Fields Tab */}
                    {activeTab === "fields" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{translations.customRequiredInfo}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {translations.customFieldsDescription}
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full w-full sm:w-auto uppercase tracking-wide text-[10px] md:text-sm">
                                            <Plus className="h-4 w-4 mr-2 shrink-0" />
                                            <span className="truncate">{translations.addCustomRequiredInfo}</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-background border-none shadow-2xl rounded-2xl">
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
