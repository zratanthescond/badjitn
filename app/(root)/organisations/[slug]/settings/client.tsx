"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Settings,
    Users,
    Trash2,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import OrganisationForm from "@/components/shared/OrganisationForm";
import MemberManagement from "@/components/shared/MemberManagement";
import { deleteOrganisation } from "@/lib/actions/organisation.actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface OrganisationSettingsClientProps {
    organisation: any;
    userId: string;
    isCreator: boolean;
}

export default function OrganisationSettingsClient({
    organisation,
    userId,
    isCreator,
}: OrganisationSettingsClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "members">("details");

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteOrganisation({
                organisationId: organisation._id,
                userId,
            });
            toast({
                title: "Organisation Deleted",
                description: "The organisation has been permanently deleted.",
            });
            router.push("/organisations");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete organisation.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back link */}
                <Link
                    href={`/organisations/${organisation.slug}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {organisation.name}
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 glass backdrop-blur-sm">
                        <Settings className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Organisation Settings
                        </h1>
                        <p className="text-muted-foreground">{organisation.name}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={activeTab === "details" ? "default" : "outline"}
                        onClick={() => setActiveTab("details")}
                        className={`rounded-full transition-all ${activeTab === "details"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                                : "glass"
                            }`}
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        Details
                    </Button>
                    <Button
                        variant={activeTab === "members" ? "default" : "outline"}
                        onClick={() => setActiveTab("members")}
                        className={`rounded-full transition-all ${activeTab === "members"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
                                : "glass"
                            }`}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Members
                    </Button>
                </div>

                {/* Tab Content */}
                {activeTab === "details" && (
                    <div className="space-y-8">
                        {/* Edit Form */}
                        <OrganisationForm
                            userId={userId}
                            type="Update"
                            organisation={organisation}
                        />

                        {/* Danger Zone */}
                        {isCreator && (
                            <Card className="border-red-200/50 dark:border-red-900/30 rounded-3xl overflow-hidden">
                                <CardHeader className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-100/50 dark:border-red-900/30">
                                    <CardTitle className="text-lg text-red-800 dark:text-red-200 flex items-center gap-2">
                                        <Trash2 className="h-5 w-5" />
                                        Danger Zone
                                    </CardTitle>
                                    <CardDescription className="text-red-600 dark:text-red-300">
                                        Irreversible actions. Proceed with caution.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Delete Organisation</h4>
                                            <p className="text-sm text-muted-foreground">
                                                This will permanently delete the organisation and all
                                                associated data.
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    className="rounded-xl"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                    )}
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete &ldquo;{organisation.name}&rdquo;?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. All events associated
                                                        with this organisation will remain but will no
                                                        longer be linked to an organisation.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDelete}
                                                        className="bg-red-500 hover:bg-red-600 rounded-xl"
                                                    >
                                                        Delete Permanently
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === "members" && (
                    <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                Team Members
                            </CardTitle>
                            <CardDescription>
                                Manage who can create and edit events for this organisation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MemberManagement
                                organisationId={organisation._id}
                                userId={userId}
                                isCreator={isCreator}
                                creator={organisation.creator}
                                admins={organisation.admins}
                                onMemberChanged={() => router.refresh()}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
