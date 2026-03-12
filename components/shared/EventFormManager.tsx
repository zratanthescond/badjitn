"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Plus,
    FileText,
    Users,
    ExternalLink,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Send,
    Loader2,
    Copy,
    Eye,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { deleteEventForm, updateEventForm } from "@/lib/actions/eventform.actions";
import EventFormBuilder from "@/components/shared/EventFormBuilder";
import EventFormSubmissions from "@/components/shared/EventFormSubmissions";

interface FormData {
    _id: string;
    title: string;
    description: string;
    slug: string;
    isActive: boolean;
    fields: any[];
    invitedEmails: string[];
    submissionCount: number;
    createdAt: string;
}

interface EventFormManagerProps {
    userId: string;
    organisationId?: string;
    forms: FormData[];
}

export default function EventFormManager({
    userId,
    organisationId,
    forms: initialForms,
}: EventFormManagerProps) {
    const [forms, setForms] = useState<FormData[]>(initialForms);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const handleToggleActive = async (formId: string, currentActive: boolean) => {
        const result = await updateEventForm({ formId, isActive: !currentActive });
        if (result.success) {
            setForms((prev) =>
                prev.map((f) => (f._id === formId ? { ...f, isActive: !currentActive } : f))
            );
            toast({
                title: !currentActive ? "Form Activated" : "Form Deactivated",
                description: !currentActive
                    ? "The form is now accepting responses"
                    : "The form is no longer accepting responses",
            });
        }
    };

    const handleDelete = async (formId: string) => {
        setIsDeleting(formId);
        const result = await deleteEventForm(formId);
        if (result.success) {
            setForms((prev) => prev.filter((f) => f._id !== formId));
            if (selectedFormId === formId) setSelectedFormId(null);
            toast({ title: "Form Deleted", description: "The form has been permanently deleted" });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
        setIsDeleting(null);
    };

    const copyLink = (slug: string) => {
        navigator.clipboard.writeText(`${baseUrl}/forms/${slug}`);
        toast({ title: "Copied!", description: "Form link copied to clipboard" });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Custom Event Forms
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Build and manage custom registration forms
                    </p>
                </div>

                <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Form
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-card">
                        <ScrollArea className="max-h-[85vh] p-6">
                            <EventFormBuilder
                                userId={userId}
                                organisationId={organisationId}
                                onFormCreated={() => {
                                    setShowBuilder(false);
                                    window.location.reload();
                                }}
                            />
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Forms List */}
            {forms.length === 0 && !showBuilder && (
                <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30">
                    <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                            <FileText className="h-10 w-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Registration Forms</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Create a custom registration form and invite attendees via email.
                        </p>
                        <Button
                            onClick={() => setShowBuilder(true)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-8"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Your First Form
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {forms.map((form) => (
                    <Card
                        key={form._id}
                        className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 shrink-0">
                                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-base truncate">{form.title}</h3>
                                        {form.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                                {form.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <Badge
                                                variant={form.isActive ? "default" : "secondary"}
                                                className={
                                                    form.isActive
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : ""
                                                }
                                            >
                                                {form.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {form.submissionCount} submission{form.submissionCount !== 1 ? "s" : ""}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {form.invitedEmails.length} invited
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 flex-wrap border-t border-border/30 pt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs"
                                    onClick={() => copyLink(form.slug)}
                                >
                                    <Copy className="h-3 w-3 mr-1.5" />
                                    Copy Link
                                </Button>
                                <Link href={`/forms/${form.slug}`} target="_blank">
                                    <Button variant="outline" size="sm" className="rounded-full text-xs">
                                        <ExternalLink className="h-3 w-3 mr-1.5" />
                                        Open Form
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs"
                                    onClick={() =>
                                        setSelectedFormId(selectedFormId === form._id ? null : form._id)
                                    }
                                >
                                    <Eye className="h-3 w-3 mr-1.5" />
                                    {selectedFormId === form._id ? "Hide" : "View"} Submissions
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs"
                                    onClick={() => handleToggleActive(form._id, form.isActive)}
                                >
                                    {form.isActive ? (
                                        <ToggleRight className="h-3 w-3 mr-1.5 text-green-500" />
                                    ) : (
                                        <ToggleLeft className="h-3 w-3 mr-1.5" />
                                    )}
                                    {form.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ml-auto"
                                    onClick={() => handleDelete(form._id)}
                                    disabled={isDeleting === form._id}
                                >
                                    {isDeleting === form._id ? (
                                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3 w-3 mr-1.5" />
                                    )}
                                    Delete
                                </Button>
                            </div>

                            {/* Submissions panel */}
                            {selectedFormId === form._id && (
                                <div className="mt-4 pt-4 border-t border-border/30">
                                    <EventFormSubmissions formId={form._id} formTitle={form.title} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
