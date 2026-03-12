"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    MapPin,
    Calendar,
    Loader2,
    CheckCircle,
    AlertCircle,
    Send,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { submitEventForm } from "@/lib/actions/eventform.actions";

interface FormField {
    _id: string;
    type: string;
    label: string;
    placeholder?: string;
    options?: string[];
    required: boolean;
    order: number;
}

interface FormData {
    _id: string;
    title: string;
    description?: string;
    coverImage?: string;
    slug: string;
    isActive: boolean;
    fields: FormField[];
    event?: {
        _id: string;
        title: string;
        imageUrl: string;
        startDateTime: string;
        endDateTime: string;
        location?: {
            name: string;
        };
    };
    creator?: {
        firstName: string;
        lastName: string;
        photo: string;
    };
    organisation?: {
        name: string;
        logo: string;
        slug: string;
    };
}

interface PublicEventFormProps {
    formData: FormData;
}

export default function PublicEventForm({ formData }: PublicEventFormProps) {
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [attendeeName, setAttendeeName] = useState("");
    const [attendeeEmail, setAttendeeEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Sort fields
    const sortedFields = [...formData.fields].sort((a, b) => a.order - b.order);

    const updateResponse = (fieldId: string, value: string | string[]) => {
        setResponses((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        setResponses((prev) => {
            const current = (prev[fieldId] as string[]) || [];
            if (checked) {
                return { ...prev, [fieldId]: [...current, option] };
            } else {
                return { ...prev, [fieldId]: current.filter((o) => o !== option) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!attendeeName.trim()) {
            setError("Please enter your name");
            return;
        }
        if (!attendeeEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        // Check required fields
        for (const field of sortedFields) {
            if (field.required) {
                const val = responses[field._id];
                if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === "string" && !val.trim())) {
                    setError(`"${field.label}" is required`);
                    return;
                }
            }
        }

        setIsSubmitting(true);

        try {
            const result = await submitEventForm({
                formId: formData._id,
                email: attendeeEmail,
                name: attendeeName,
                responses: sortedFields.map((field) => ({
                    fieldId: field._id,
                    label: field.label,
                    value: responses[field._id] || "",
                })),
            });

            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.message || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const eventDate = formData.event?.startDateTime
        ? new Date(formData.event.startDateTime).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-purple-950/10 flex items-center justify-center p-4">
                <Card className="max-w-md w-full glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                        <p className="text-muted-foreground mb-4">
                            Thank you, <strong>{attendeeName}</strong>! Your registration for{" "}
                            <strong>{formData.title}</strong> has been submitted successfully.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            A confirmation will be sent to <strong>{attendeeEmail}</strong>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Inactive form
    if (!formData.isActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-purple-950/10 flex items-center justify-center p-4">
                <Card className="max-w-md w-full glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
                            <AlertCircle className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Form Closed</h2>
                        <p className="text-muted-foreground">
                            This registration form is no longer accepting responses.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-purple-950/10 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Event Banner or Form Title Banner */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    {formData.coverImage ? (
                        <div className="relative h-48 sm:h-64">
                            <img
                                src={formData.coverImage}
                                alt={formData.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {formData.title}
                                </h1>
                                {formData.description && (
                                    <p className="text-white/80 text-sm max-w-2xl line-clamp-2">
                                        {formData.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : formData.event?.imageUrl ? (
                        <div className="relative h-48 sm:h-56">
                            <img
                                src={formData.event.imageUrl}
                                alt={formData.event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {formData.event.title}
                                </h1>
                                <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
                                    {eventDate && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {eventDate}
                                        </span>
                                    )}
                                    {formData.event.location?.name && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {formData.event.location.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-40 sm:h-48 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                            <div className="text-center p-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {formData.title}
                                </h1>
                                {formData.description && (
                                    <p className="text-white/80 text-sm max-w-md">{formData.description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Organisation / Organizer */}
                <div className="flex items-center gap-3 px-1">
                    {formData.organisation ? (
                        <>
                            {formData.organisation.logo && (
                                <img
                                    src={formData.organisation.logo}
                                    alt={formData.organisation.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow"
                                />
                            )}
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                                    {formData.organisation.name}
                                </p>
                                <p className="text-xs text-muted-foreground">Event Organizer</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {formData.creator?.photo && (
                                <img
                                    src={formData.creator.photo}
                                    alt={`${formData.creator.firstName} ${formData.creator.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow"
                                />
                            )}
                            <div>
                                <p className="text-sm font-medium">
                                    {formData.creator?.firstName} {formData.creator?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">Event Organizer</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Form */}
                <Card className="glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-xl">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold">{formData.title}</h2>
                        </div>
                        {formData.description && (
                            <p className="text-sm text-muted-foreground mb-6 ml-12">{formData.description}</p>
                        )}

                        <Separator className="mb-6" />

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name & Email (always required) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={attendeeName}
                                        onChange={(e) => setAttendeeName(e.target.value)}
                                        placeholder="Your full name"
                                        className="mt-1.5 bg-white/50 dark:bg-slate-800/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        value={attendeeEmail}
                                        onChange={(e) => setAttendeeEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="mt-1.5 bg-white/50 dark:bg-slate-800/50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic fields */}
                            {sortedFields.map((field) => (
                                <div key={field._id} className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>

                                    {field.type === "textarea" ? (
                                        <Textarea
                                            value={(responses[field._id] as string) || ""}
                                            onChange={(e) => updateResponse(field._id, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="bg-white/50 dark:bg-slate-800/50 min-h-[100px]"
                                            required={field.required}
                                        />
                                    ) : field.type === "select" ? (
                                        <Select
                                            value={(responses[field._id] as string) || ""}
                                            onValueChange={(val) => updateResponse(field._id, val)}
                                        >
                                            <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt, i) => (
                                                    <SelectItem key={i} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === "radio" ? (
                                        <div className="space-y-2 pt-1">
                                            {field.options?.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <input
                                                        type="radio"
                                                        id={`${field._id}-${i}`}
                                                        name={`radio-${field._id}`}
                                                        value={opt}
                                                        checked={(responses[field._id] as string) === opt}
                                                        onChange={() => updateResponse(field._id, opt)}
                                                        className="accent-indigo-500 w-4 h-4"
                                                        required={field.required}
                                                    />
                                                    <Label htmlFor={`${field._id}-${i}`} className="text-sm cursor-pointer">
                                                        {opt}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : field.type === "checkbox" ? (
                                        <div className="space-y-2 pt-1">
                                            {field.options?.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <Checkbox
                                                        id={`${field._id}-${i}`}
                                                        checked={((responses[field._id] as string[]) || []).includes(opt)}
                                                        onCheckedChange={(checked) =>
                                                            handleCheckboxChange(field._id, opt, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={`${field._id}-${i}`} className="text-sm cursor-pointer">
                                                        {opt}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Input
                                            type={
                                                field.type === "date"
                                                    ? "date"
                                                    : field.type === "number"
                                                        ? "number"
                                                        : field.type === "email"
                                                            ? "email"
                                                            : field.type === "phone"
                                                                ? "tel"
                                                                : "text"
                                            }
                                            value={(responses[field._id] as string) || ""}
                                            onChange={(e) => updateResponse(field._id, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="bg-white/50 dark:bg-slate-800/50"
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full py-6 text-base font-semibold shadow-lg shadow-indigo-500/25"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5 mr-2" />
                                )}
                                {isSubmitting ? "Submitting..." : "Submit Registration"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground pb-8">
                    Powered by <strong>Badji.tn</strong> — Event Management Platform
                </p>
            </div>
        </div>
    );
}
