"use client";

import { useState, useCallback, useRef } from "react";
import {
    Plus,
    Trash2,
    GripVertical,
    Type,
    Hash,
    Mail,
    List,
    CircleDot,
    CheckSquare,
    AlignLeft,
    Calendar,
    Phone,
    ChevronDown,
    ChevronUp,
    Eye,
    Send,
    Save,
    Loader2,
    FileText,
    X,
    Upload,
    Building2,
    Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { createEventForm, updateEventForm, sendFormInvitations } from "@/lib/actions/eventform.actions";
import { ImageUploader } from "@/components/shared/ImageUploader";

type FieldType = "text" | "number" | "email" | "select" | "radio" | "checkbox" | "textarea" | "date" | "phone";

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder: string;
    options: string[];
    required: boolean;
    isEditing: boolean;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
    { type: "text", label: "Text", icon: Type },
    { type: "email", label: "Email", icon: Mail },
    { type: "number", label: "Number", icon: Hash },
    { type: "phone", label: "Phone", icon: Phone },
    { type: "textarea", label: "Long Text", icon: AlignLeft },
    { type: "select", label: "Dropdown", icon: List },
    { type: "radio", label: "Radio", icon: CircleDot },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "date", label: "Date", icon: Calendar },
];

interface Organisation {
    _id: string;
    name: string;
    logo?: string;
}

// Edit mode data
interface EditFormData {
    _id: string;
    title: string;
    description?: string;
    coverImage?: string;
    organisation?: { _id: string; name: string };
    fields: {
        _id?: string;
        type: FieldType;
        label: string;
        placeholder?: string;
        options?: string[];
        required: boolean;
        order: number;
    }[];
    slug: string;
    invitedEmails: string[];
}

interface EventFormBuilderProps {
    userId: string;
    organisations?: Organisation[];
    organisationId?: string;
    editForm?: EditFormData;
    onFormCreated?: (formSlug: string) => void;
    onFormUpdated?: () => void;
}

export default function EventFormBuilder({
    userId,
    organisations = [],
    organisationId,
    editForm,
    onFormCreated,
    onFormUpdated,
}: EventFormBuilderProps) {
    const isEditMode = !!editForm;

    const [formTitle, setFormTitle] = useState(editForm?.title || "");
    const [formDescription, setFormDescription] = useState(editForm?.description || "");
    const [coverImage, setCoverImage] = useState(editForm?.coverImage || "");
    const [selectedOrgId, setSelectedOrgId] = useState(editForm?.organisation?._id || organisationId || "");
    const [fields, setFields] = useState<FormField[]>(
        editForm?.fields?.map((f, i) => ({
            id: f._id || Math.random().toString(36).slice(2, 11),
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || "",
            options: f.options || [],
            required: f.required,
            isEditing: false,
        })) || []
    );
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [createdFormId, setCreatedFormId] = useState<string | null>(editForm?._id || null);
    const [createdFormSlug, setCreatedFormSlug] = useState<string | null>(editForm?.slug || null);

    // Email invitation state
    const [emailInput, setEmailInput] = useState("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateId = () => Math.random().toString(36).slice(2, 11);

    const addField = useCallback((type: FieldType) => {
        const newField: FormField = {
            id: generateId(),
            type,
            label: "",
            placeholder: "",
            options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2"] : [],
            required: false,
            isEditing: true,
        };
        setFields((prev) => [...prev, newField]);
    }, []);

    const updateField = useCallback((id: string, key: keyof FormField, value: any) => {
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
        );
    }, []);

    const removeField = useCallback((id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const moveField = useCallback((id: string, direction: "up" | "down") => {
        setFields((prev) => {
            const idx = prev.findIndex((f) => f.id === id);
            if (idx === -1) return prev;
            if (direction === "up" && idx === 0) return prev;
            if (direction === "down" && idx === prev.length - 1) return prev;
            const newFields = [...prev];
            const target = direction === "up" ? idx - 1 : idx + 1;
            [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
            return newFields;
        });
    }, []);

    const handleSave = async () => {
        if (!formTitle.trim()) {
            toast({ title: "Error", description: "Please enter a form title", variant: "destructive" });
            return;
        }
        if (!selectedOrgId) {
            toast({ title: "Error", description: "Please select an organisation", variant: "destructive" });
            return;
        }
        if (fields.length === 0) {
            toast({ title: "Error", description: "Please add at least one field", variant: "destructive" });
            return;
        }
        const emptyLabels = fields.filter((f) => !f.label.trim());
        if (emptyLabels.length > 0) {
            toast({ title: "Error", description: "All fields must have a label", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            if (isEditMode && editForm) {
                // Update existing form
                const result = await updateEventForm({
                    formId: editForm._id,
                    title: formTitle,
                    description: formDescription,
                    coverImage: coverImage,
                    fields: fields.map((f) => ({
                        type: f.type,
                        label: f.label,
                        placeholder: f.placeholder,
                        options: f.options,
                        required: f.required,
                        order: 0,
                    })),
                });

                if (result.success) {
                    toast({ title: "Updated!", description: "Form updated successfully" });
                    onFormUpdated?.();
                } else {
                    toast({ title: "Error", description: result.message || "Unknown error", variant: "destructive" });
                }
            } else {
                // Create new form
                const result = await createEventForm({
                    title: formTitle,
                    description: formDescription,
                    coverImage: coverImage,
                    organisationId: selectedOrgId,
                    creatorId: userId,
                    fields: fields.map((f) => ({
                        type: f.type,
                        label: f.label,
                        placeholder: f.placeholder,
                        options: f.options,
                        required: f.required,
                        order: 0,
                    })),
                });

                if (result.success) {
                    setCreatedFormId(result.data._id);
                    setCreatedFormSlug(result.data.slug);
                    toast({ title: "Success!", description: "Form created successfully" });
                    onFormCreated?.(result.data.slug);
                } else {
                    toast({ title: "Error", description: result.message || "Unknown error", variant: "destructive" });
                }
            }
        } catch (err) {
            console.error("[EventFormBuilder] Error:", err);
            toast({ title: "Error", description: "Failed to save form: " + (err as Error).message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Email handling
    const addEmails = () => {
        const newEmails = emailInput
            .split(/[,;\n]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

        const unique = newEmails.filter((e) => !emailList.includes(e));
        if (unique.length > 0) {
            setEmailList((prev) => [...prev, ...unique]);
            toast({ title: "Added!", description: `${unique.length} email(s) added to the list` });
        }
        setEmailInput("");
    };

    const removeEmail = (email: string) => {
        setEmailList((prev) => prev.filter((e) => e !== email));
    };

    // Excel / CSV file upload handler
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
                // Parse CSV/TXT
                const text = await file.text();
                const emails = text
                    .split(/[,;\n\r]+/)
                    .map((line) => line.trim().toLowerCase())
                    .filter((line) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line));

                const unique = emails.filter((e) => !emailList.includes(e));
                if (unique.length > 0) {
                    setEmailList((prev) => [...prev, ...unique]);
                    toast({ title: "File Imported!", description: `${unique.length} email(s) found in ${file.name}` });
                } else {
                    toast({ title: "No new emails", description: "No valid new emails found in the file", variant: "destructive" });
                }
            } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
                // Parse Excel using xlsx library (loaded dynamically)
                const arrayBuffer = await file.arrayBuffer();
                const XLSX = await import("xlsx");
                const workbook = XLSX.read(arrayBuffer, { type: "array" });

                const allEmails: string[] = [];
                workbook.SheetNames.forEach((sheetName) => {
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1 });

                    data.forEach((row: any) => {
                        if (Array.isArray(row)) {
                            row.forEach((cell: any) => {
                                const cellStr = String(cell || "").trim().toLowerCase();
                                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cellStr)) {
                                    allEmails.push(cellStr);
                                }
                            });
                        }
                    });
                });

                const unique = allEmails.filter((e) => !emailList.includes(e));
                if (unique.length > 0) {
                    setEmailList((prev) => [...prev, ...unique]);
                    toast({ title: "Excel Imported!", description: `${unique.length} email(s) found in ${file.name}` });
                } else {
                    toast({ title: "No new emails", description: "No valid new emails found in the file", variant: "destructive" });
                }
            } else {
                toast({ title: "Unsupported file", description: "Please upload a .csv, .txt, or .xlsx file", variant: "destructive" });
            }
        } catch (err) {
            console.error("File parse error:", err);
            toast({ title: "Error", description: "Failed to parse file. Please check the format.", variant: "destructive" });
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendInvitations = async () => {
        if (!createdFormId || emailList.length === 0) return;

        setIsSending(true);
        try {
            const result = await sendFormInvitations({
                formId: createdFormId,
                emails: emailList,
            });

            if (result.success) {
                toast({ title: "Invitations Sent!", description: result.message });
                setEmailList([]);
                setEmailInput("");
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to send invitations", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    const formUrl = createdFormSlug
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${createdFormSlug}`
        : null;

    // In edit mode, show email section immediately
    const showEmailSection = isEditMode || !!createdFormId;

    return (
        <ScrollArea className="h-[calc(100vh-120px)] sm:h-auto -mx-6 px-6">
            <div className="space-y-6 pb-32 md:pb-8">
            {/* Form Header */}
            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        {isEditMode ? (
                            <Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">
                            {isEditMode ? "Edit Custom Event Form" : "Create Custom Event Form"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode ? "Modify your form fields and settings" : "Build your registration form with custom fields"}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Organisation selector */}
                    <div>
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            Organisation *
                        </Label>
                        {organisations.length > 0 ? (
                            <Select
                                value={selectedOrgId}
                                onValueChange={setSelectedOrgId}
                                disabled={isEditMode}
                            >
                                <SelectTrigger className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select an organisation..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {organisations.map((org) => (
                                        <SelectItem key={org._id} value={org._id}>
                                            <div className="flex items-center gap-2">
                                                {org.logo ? (
                                                    <img src={org.logo} alt="" className="h-4 w-4 rounded object-cover" />
                                                ) : (
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                {org.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-700/30">
                                You need to create an organisation first before creating forms.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Form Title *</Label>
                        <Input
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                            placeholder="e.g. Workshop Registration, Conference Sign-up..."
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Description (optional)</Label>
                        <Textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 min-h-[80px]"
                            placeholder="Describe your event and what information you need from attendees..."
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Cover Photo (optional)</Label>
                        <div className="mt-1.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <ImageUploader
                                value={coverImage}
                                onChange={setCoverImage}
                                aspectRatio="wide"
                                placeholder="Upload a cover photo for your custom event form..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Field Buttons */}
            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Add Fields
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addField(type)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/40 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
                        >
                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Fields List */}
            {fields.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground px-1">
                        Form Fields ({fields.length})
                    </h3>
                    {fields.map((field, index) => (
                        <Card
                            key={field.id}
                            className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 overflow-hidden"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Drag handle & reorder */}
                                    <div className="flex flex-col items-center gap-0.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => moveField(field.id, "up")}
                                            disabled={index === 0}
                                            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                        <button
                                            type="button"
                                            onClick={() => moveField(field.id, "down")}
                                            disabled={index === fields.length - 1}
                                            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Field config */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="text-xs">
                                                {FIELD_TYPES.find((t) => t.type === field.type)?.label || field.type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Label *</Label>
                                                <Input
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, "label", e.target.value)}
                                                    placeholder="Field label"
                                                    className="mt-1 h-9 text-sm bg-white/50 dark:bg-slate-800/50"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Placeholder</Label>
                                                <Input
                                                    value={field.placeholder}
                                                    onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                                                    placeholder="Placeholder text"
                                                    className="mt-1 h-9 text-sm bg-white/50 dark:bg-slate-800/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Options for select/radio/checkbox */}
                                        {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                                            <div>
                                                <Label className="text-xs text-muted-foreground">
                                                    Options (comma separated)
                                                </Label>
                                                <Input
                                                    value={field.options.join(", ")}
                                                    onChange={(e) =>
                                                        updateField(
                                                            field.id,
                                                            "options",
                                                            e.target.value.split(",").map((o) => o.trim())
                                                        )
                                                    }
                                                    placeholder="Option 1, Option 2, Option 3"
                                                    className="mt-1 h-9 text-sm bg-white/50 dark:bg-slate-800/50"
                                                />
                                            </div>
                                        )}

                                        {/* Required toggle */}
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={field.required}
                                                onCheckedChange={(checked) => updateField(field.id, "required", checked)}
                                                className="scale-75"
                                            />
                                            <Label className="text-xs text-muted-foreground">Required field</Label>
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        onClick={() => removeField(field.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preview */}
            {showPreview && fields.length > 0 && (
                <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-indigo-200/30 dark:border-indigo-700/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Eye className="h-4 w-4 text-indigo-500" />
                            Form Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formTitle && <h3 className="text-xl font-bold">{formTitle}</h3>}
                        {formDescription && <p className="text-sm text-muted-foreground">{formDescription}</p>}
                        <Separator />
                        {fields.map((field) => (
                            <div key={field.id} className="space-y-1.5">
                                <Label className="text-sm">
                                    {field.label || "Untitled Field"}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                {field.type === "textarea" ? (
                                    <Textarea placeholder={field.placeholder} disabled className="bg-white/50 dark:bg-slate-800/50" />
                                ) : field.type === "select" ? (
                                    <Select disabled>
                                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options.map((opt, i) => (
                                                <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : field.type === "radio" ? (
                                    <div className="space-y-1.5">
                                        {field.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="radio" disabled name={`preview-${field.id}`} className="accent-indigo-500" />
                                                <span className="text-sm">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : field.type === "checkbox" ? (
                                    <div className="space-y-1.5">
                                        {field.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="checkbox" disabled className="accent-indigo-500" />
                                                <span className="text-sm">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Input
                                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                                        placeholder={field.placeholder}
                                        disabled
                                        className="bg-white/50 dark:bg-slate-800/50"
                                    />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            {(!createdFormId || isEditMode) && (
                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        variant="outline"
                        className="rounded-full"
                        disabled={fields.length === 0}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? "Hide Preview" : "Preview"}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || fields.length === 0 || !selectedOrgId}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isSaving ? "Saving..." : isEditMode ? "Update Form" : "Create Form"}
                    </Button>
                </div>
            )}

            {/* Post-creation: Share link & Send Invitations */}
            {showEmailSection && formUrl && (
                <div className="space-y-6">
                    {/* Form Link */}
                    <div className="glass bg-gradient-to-r from-green-50/70 to-emerald-50/70 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-md border border-green-200/30 dark:border-green-700/30 rounded-2xl p-6">
                        <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                            {isEditMode ? "📋 Form Link" : "✅ Form Created Successfully!"}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Input
                                value={formUrl}
                                readOnly
                                className="bg-white/70 dark:bg-slate-800/70 text-sm font-mono"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => {
                                    navigator.clipboard.writeText(formUrl);
                                    toast({ title: "Copied!", description: "Form link copied to clipboard" });
                                }}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>

                    {/* Email Invitations */}
                    <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Send className="h-4 w-4 text-indigo-500" />
                            Send Invitations
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enter email addresses manually or upload a CSV/Excel file containing the attendee email list.
                        </p>

                        <div className="space-y-3">
                            {/* Manual email input */}
                            <div>
                                <Label className="text-xs text-muted-foreground">
                                    Email Addresses (comma, semicolon, or newline separated)
                                </Label>
                                <Textarea
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com..."
                                    className="mt-1.5 bg-white/50 dark:bg-slate-800/50 min-h-[80px]"
                                />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    type="button"
                                    onClick={addEmails}
                                    variant="outline"
                                    className="rounded-full"
                                    disabled={!emailInput.trim()}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Emails
                                </Button>

                                {/* File upload */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="email-file-upload"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import from File
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Supports .csv, .txt, .xlsx
                                </span>
                            </div>

                            {/* Email list */}
                            {emailList.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Recipients ({emailList.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        {emailList.map((email) => (
                                            <Badge
                                                key={email}
                                                variant="secondary"
                                                className="pl-2.5 pr-1 py-1 flex items-center gap-1"
                                            >
                                                <span className="text-xs">{email}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEmail(email)}
                                                    className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleSendInvitations}
                                        disabled={isSending || emailList.length === 0}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full"
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        {isSending ? "Sending..." : `Send to ${emailList.length} recipient${emailList.length > 1 ? "s" : ""}`}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </ScrollArea>
);
}
