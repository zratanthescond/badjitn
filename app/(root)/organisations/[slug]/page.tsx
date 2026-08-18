import { notFound } from "next/navigation";
import { getOrganisationBySlug } from "@/lib/actions/organisation.actions";
import { useUser } from "@/lib/actions/user.actions";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import Organisation from "@/lib/database/models/organisation.model";
import { connectToDatabase } from "@/lib/database";
import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Globe,
    CheckCircle,
    Users,
    Settings,
    Calendar,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Sponsor from "@/lib/database/models/sponor.model";
import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const params = await props.params;
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";

    try {
        const organisation = await getOrganisationBySlug(params.slug);
        if (!organisation) {
            return {
                title: "Organisation Not Found | Badgi.net",
                description: "The requested organisation could not be found on Badgi.net.",
            };
        }

        const title = `${organisation.name} - Events & Profile`;
        const description =
            organisation.description?.slice(0, 160) ||
            `Explore upcoming events, conferences, and tickets hosted by ${organisation.name} on Badgi.net.`;
        const orgUrl = `${baseUrl}/organisations/${organisation.slug}`;
        const ogImage =
            organisation.coverImage ||
            organisation.logo ||
            `${baseUrl}/api/og?title=${encodeURIComponent(organisation.name)}&category=Organisation&type=org`;

        return {
            title,
            description,
            alternates: {
                canonical: orgUrl,
            },
            openGraph: {
                title: `${organisation.name} | Badgi.net`,
                description,
                url: orgUrl,
                siteName: "Badgi.net",
                images: [{ url: ogImage, width: 1200, height: 630, alt: organisation.name }],
                type: "profile",
            },
            twitter: {
                card: "summary_large_image",
                title: `${organisation.name} | Badgi.net`,
                description,
                images: [ogImage],
            },
        };
    } catch {
        return {
            title: "Organisation | Badgi.net",
        };
    }
}

async function getOrganisationEvents(orgId: string, page: number = 1, limit: number = 6) {
    await connectToDatabase();
    const skipAmount = (page - 1) * limit;
    const conditions = { organisation: orgId };

    const eventsQuery = Event.find(conditions)
        .populate({
            path: "organizer",
            model: User,
            select: "_id firstName lastName photo",
        })
        .populate({ path: "category", model: Category, select: "_id name" })
        .populate({ path: "Sponsors", model: Sponsor, select: "_id" })
        .populate({
            path: "organisation",
            model: Organisation,
            select: "_id name slug logo",
        })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(limit);

    const events = await eventsQuery;
    const eventsCount = await Event.countDocuments(conditions);

    return {
        data: JSON.parse(JSON.stringify(events)),
        totalPages: Math.ceil(eventsCount / limit),
    };
}

export default async function OrganisationPage(
    props: {
        params: Promise<{ slug: string }>;
        searchParams: Promise<{ page?: string }>;
    }
) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    let organisation;
    try {
        organisation = await getOrganisationBySlug(params.slug);
    } catch {
        notFound();
    }

    if (!organisation) notFound();

    const user = await useUser();
    const currentPage = Number(searchParams?.page) || 1;
    const events = await getOrganisationEvents(organisation._id, currentPage);

    const isCreator = user && organisation.creator._id === user._id;
    const isAdmin =
        user &&
        organisation.admins?.some((admin: any) => admin._id === user._id);
    const hasAccess = isCreator || isAdmin;
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net";
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organisation.name,
        description: organisation.description,
        url: `${baseUrl}/organisations/${organisation.slug}`,
        logo: organisation.logo,
        image: organisation.coverImage,
        sameAs: [
            organisation.socialLinks?.twitter,
            organisation.socialLinks?.linkedin,
            organisation.socialLinks?.facebook,
            organisation.socialLinks?.instagram,
            organisation.website,
        ].filter(Boolean),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
            <JsonLd data={orgSchema} />
            {/* Hero / Cover Section */}
            <div className="relative">
                {organisation.coverImage ? (
                    <div className="h-48 md:h-64 w-full overflow-hidden">
                        <img
                            src={organisation.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                ) : (
                    <div className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                )}

                {/* Org Info Overlay */}
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="relative -mt-16 md:-mt-20 mb-6">
                        <div className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-start gap-5">
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                    {organisation.logo ? (
                                        <img
                                            src={organisation.logo}
                                            alt={organisation.name}
                                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                                            <Building2 className="h-10 w-10 md:h-12 md:w-12 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Text Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-bold">
                                            {organisation.name}
                                        </h1>
                                        {organisation.isVerified && (
                                            <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>

                                    <p className="text-muted-foreground mb-4 line-clamp-3 max-w-2xl">
                                        {organisation.description || "No description provided"}
                                    </p>

                                    {/* Meta Row */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {organisation.admins?.length || 1} member
                                                {organisation.admins?.length !== 1 && "s"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{events.data.length} events</span>
                                        </div>
                                        {organisation.website && (
                                            <a
                                                href={organisation.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
                                            >
                                                <Globe className="h-4 w-4" />
                                                <span>
                                                    {organisation.website.replace(/https?:\/\//, "")}
                                                </span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {organisation.socialLinks && (
                                        <div className="flex items-center gap-3 mt-3">
                                            {organisation.socialLinks.facebook && (
                                                <a
                                                    href={organisation.socialLinks.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                                                >
                                                    Facebook
                                                </a>
                                            )}
                                            {organisation.socialLinks.twitter && (
                                                <a
                                                    href={organisation.socialLinks.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-sky-500 transition-colors"
                                                >
                                                    Twitter
                                                </a>
                                            )}
                                            {organisation.socialLinks.instagram && (
                                                <a
                                                    href={organisation.socialLinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-pink-500 transition-colors"
                                                >
                                                    Instagram
                                                </a>
                                            )}
                                            {organisation.socialLinks.linkedin && (
                                                <a
                                                    href={organisation.socialLinks.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-blue-700 transition-colors"
                                                >
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions (for org owner/admin) */}
                                {hasAccess && (
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="glass rounded-full border-indigo-200/50 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                        >
                                            <Link
                                                href={`/organisations/${organisation.slug}/settings`}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Settings
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full"
                                        >
                                            <Link href="/events/create">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                New Event
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Events Section */}
            <div className="container mx-auto px-4 max-w-5xl pb-12">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-indigo-500" />
                        Events
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Events published by {organisation.name}
                    </p>
                </div>

                <Collection
                    data={events.data}
                    emptyTitle="No events yet"
                    emptyStateSubtext={`${organisation.name} hasn't published any events yet.`}
                    collectionType="All_Events"
                    limit={6}
                    page={currentPage}
                    urlParamName="page"
                    totalPages={events.totalPages}
                />
            </div>
        </div>
    );
}

