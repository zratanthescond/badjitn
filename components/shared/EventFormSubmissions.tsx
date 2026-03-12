"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Download,
    Search,
    Clock,
    Mail,
    User,
    FileText,
    ChevronDown,
    ChevronUp,
    Loader2,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormSubmissions } from "@/lib/actions/eventform.actions";

interface Submission {
    _id: string;
    name: string;
    email: string;
    responses: {
        fieldId: string;
        label: string;
        value: string | string[];
    }[];
    submittedAt: string;
}

interface EventFormSubmissionsProps {
    formId: string;
    formTitle: string;
}

export default function EventFormSubmissions({ formId, formTitle }: EventFormSubmissionsProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

    useEffect(() => {
        loadSubmissions();
    }, [formId]);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const result = await getFormSubmissions(formId);
            if (result.success) {
                setSubmissions(result.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportCSV = () => {
        if (submissions.length === 0) return;

        // Collect all unique labels
        const allLabels = new Set<string>();
        submissions.forEach((s) => s.responses.forEach((r) => allLabels.add(r.label)));
        const labelArr = Array.from(allLabels);

        // Build CSV
        const headers = ["Name", "Email", "Submitted At", ...labelArr];
        const rows = submissions.map((s) => {
            const responseMap: Record<string, string> = {};
            s.responses.forEach((r) => {
                responseMap[r.label] = Array.isArray(r.value) ? r.value.join(", ") : r.value;
            });
            return [
                s.name,
                s.email,
                new Date(s.submittedAt).toLocaleString(),
                ...labelArr.map((label) => responseMap[label] || ""),
            ];
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${formTitle.replace(/\s+/g, "_")}_submissions.csv`;
        link.click();
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-muted-foreground/10" />
                <Skeleton className="h-24 w-full bg-muted-foreground/10" />
                <Skeleton className="h-24 w-full bg-muted-foreground/10" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{formTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {submissions.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={exportCSV}
                        className="rounded-full"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                )}
            </div>

            {/* Search */}
            {submissions.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="pl-10 bg-white/50 dark:bg-slate-800/50"
                    />
                </div>
            )}

            {/* Empty state */}
            {submissions.length === 0 && (
                <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-muted-foreground/20">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">No submissions yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Submissions will appear here once attendees fill out the form.
                    </p>
                </div>
            )}

            {/* Submissions list */}
            {filteredSubmissions.map((submission) => {
                const isExpanded = expandedSubmission === submission._id;
                return (
                    <Card
                        key={submission._id}
                        className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                setExpandedSubmission(isExpanded ? null : submission._id)
                            }
                            className="w-full text-left"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {submission.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{submission.name}</p>
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {submission.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Badge variant="secondary" className="text-xs hidden sm:flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                        </Badge>
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </button>

                        {isExpanded && (
                            <>
                                <Separator />
                                <CardContent className="p-4 bg-slate-50/50 dark:bg-slate-800/20">
                                    <div className="space-y-3">
                                        {submission.responses.map((r, i) => (
                                            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    {r.label}
                                                </p>
                                                <p className="text-sm sm:col-span-2">
                                                    {Array.isArray(r.value)
                                                        ? r.value.join(", ")
                                                        : r.value || (
                                                            <span className="text-muted-foreground italic">Empty</span>
                                                        )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                    </div>
                                </CardContent>
                            </>
                        )}
                    </Card>
                );
            })}

            {searchQuery && filteredSubmissions.length === 0 && submissions.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    No submissions match your search.
                </div>
            )}
        </div>
    );
}
