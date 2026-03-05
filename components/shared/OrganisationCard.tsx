"use client";

import Link from "next/link";
import {
    Building2,
    Globe,
    Users,
    CheckCircle,
    ArrowRight,
    Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrganisationCardProps {
    organisation: {
        _id: string;
        name: string;
        slug: string;
        description: string;
        logo?: string;
        website?: string;
        isVerified: boolean;
        admins: any[];
        creator: {
            _id: string;
            firstName: string;
            lastName: string;
            photo?: string;
        };
        createdAt: string;
    };
    isCreator?: boolean;
}

export default function OrganisationCard({
    organisation,
    isCreator,
}: OrganisationCardProps) {
    return (
        <Link href={`/organisations/${organisation.slug}`}>
            <div className="group glass bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-indigo-300/50 dark:hover:border-indigo-600/50 cursor-pointer">
                {/* Top gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Logo / Avatar */}
                        <div className="flex-shrink-0">
                            {organisation.logo ? (
                                <img
                                    src={organisation.logo}
                                    alt={organisation.name}
                                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/50 dark:border-slate-700/50 shadow-sm"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                                    <Building2 className="h-7 w-7 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {organisation.name}
                                </h3>
                                {organisation.isVerified && (
                                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {organisation.description || "No description yet"}
                            </p>

                            {/* Meta info */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>
                                        {organisation.admins?.length || 1}{" "}
                                        {organisation.admins?.length === 1 ? "member" : "members"}
                                    </span>
                                </div>
                                {organisation.website && (
                                    <div className="flex items-center gap-1">
                                        <Globe className="h-3.5 w-3.5" />
                                        <span className="truncate max-w-[120px]">
                                            {organisation.website.replace(/https?:\/\//, "")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Role badge + Arrow */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {isCreator ? (
                                <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs">
                                    Owner
                                </Badge>
                            ) : (
                                <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs">
                                    Admin
                                </Badge>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
