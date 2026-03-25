"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    Plus,
    Trash2,
    GripVertical,
    Type,
    Hash,
    List,
    CircleDot,
    ChevronDown,
    ChevronUp,
    Pencil,
    Save,
    Loader2,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { fetchFields, saveFields } from "@/lib/actions/field.action";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FieldType = "text" | "number" | "select" | "radio";

interface Field {
    id: string | number;
    type: FieldType;
    label: string;
    placeholder?: string;
    options?: string[];
    required: boolean;
    order: number;
    isEditing: boolean;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
    { type: "text", label: "Text", icon: Type },
    { type: "number", label: "Number", icon: Hash },
    { type: "select", label: "Dropdown", icon: List },
    { type: "radio", label: "Radio", icon: CircleDot },
];

const FormBuilder = ({ userId }: { userId: string }) => {
    const t = useTranslations("FormBuilder");
    const locale = useLocale();
    const isRTL = locale === "ar";

    const [fields, setFields] = useState<Field[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const generateId = () => Math.random().toString(36).slice(2, 11);

    // Initial load
    useEffect(() => {
        const loadFields = async () => {
            setIsLoading(true);
            try {
                const response = await fetchFields(userId);
                if (response.success && response.data) {
                    setFields(
                        response.data.map((f: any) => ({
                            id: f._id,
                            type: f.type,
                            label: f.label,
                            placeholder: f.placeholder || "",
                            options: f.options || [],
                            required: f.required ?? true,
                            order: f.order || 0,
                            isEditing: false,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to fetch fields:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadFields();
    }, [userId]);

    const addField = (type: FieldType) => {
        const newField: Field = {
            id: generateId(),
            type,
            label: "",
            placeholder: "",
            options: type === "select" || type === "radio" ? ["Option 1", "Option 2"] : [],
            required: true,
            order: fields.length,
            isEditing: true,
        };
        setFields((prev) => [...prev, newField]);
    };

    const updateField = (id: string | number, key: keyof Field, value: any) => {
        setFields((prev) =>
            prev.map((field) => (field.id === id ? { ...field, [key]: value } : field))
        );
    };

    const removeField = (id: string | number) => {
        setFields((prev) => prev.filter((field) => field.id !== id));
    };

    const moveField = useCallback((id: string | number, direction: "up" | "down") => {
        setFields((prev) => {
            const idx = prev.findIndex((f) => f.id === id);
            if (idx === -1) return prev;
            if (direction === "up" && idx === 0) return prev;
            if (direction === "down" && idx === prev.length - 1) return prev;
            
            const newFields = [...prev];
            const target = direction === "up" ? idx - 1 : idx + 1;
            [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
            
            // Update order properties
            return newFields.map((f, i) => ({ ...f, order: i }));
        });
    }, []);

    const toggleEditing = (id: string | number) => {
        setFields((prev) =>
            prev.map((field) =>
                field.id === id ? { ...field, isEditing: !field.isEditing } : field
            )
        );
    };

    const handleSave = async () => {
        if (fields.length === 0) {
            toast({ title: t("validation.noFields") || "Please add at least one field", variant: "destructive" });
            return;
        }

        const emptyLabels = fields.filter((f) => !f.label.trim());
        if (emptyLabels.length > 0) {
            toast({ title: t("validation.emptyLabels"), variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const formattedFields = fields.map((f, index) => ({
                userId,
                type: f.type,
                label: f.label,
                placeholder: f.placeholder,
                options: f.options,
                required: f.required,
                order: index,
            }));

            const response = await saveFields(userId, formattedFields);

            if (response.success) {
                toast({ 
                    title: t("messages.saveSuccess"), 
                    description: "Your custom fields have been updated." 
                });
                // After save, close all editors
                setFields(prev => prev.map(f => ({ ...f, isEditing: false })));
            } else {
                toast({ 
                    title: t("messages.saveError"), 
                    description: response.message, 
                    variant: "destructive" 
                });
            }
        } catch (err) {
            toast({ 
                title: "Error", 
                description: "Failed to save fields", 
                variant: "destructive" 
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading your custom fields...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]" dir={isRTL ? "rtl" : "ltr"}>
            {/* Header section - stays at top */}
            <div className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-2xl p-4 mb-4 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight">{t("title")}</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">
                            Custom Event Registration Fields
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addField(type)}
                            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border/40 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
                        >
                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {t(`fieldTypes.${type === "select" ? "dropdown" : type}`)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Fields List */}
            <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-4 pb-32 md:pb-20">
                    {fields.length > 0 ? (
                        fields.map((field, index) => (
                            <Card
                                key={field.id}
                                className={cn(
                                    "glass transition-all duration-300 border border-white/20 dark:border-slate-700/30 overflow-hidden",
                                    field.isEditing ? "ring-2 ring-indigo-500/20 shadow-lg" : "hover:shadow-md"
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Drag handle & reorder */}
                                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => moveField(field.id, "up")}
                                                disabled={index === 0}
                                                className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-20 text-muted-foreground transition-colors"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </button>
                                            <GripVertical className="h-5 w-5 text-muted-foreground/30" />
                                            <button
                                                type="button"
                                                onClick={() => moveField(field.id, "down")}
                                                disabled={index === fields.length - 1}
                                                className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-20 text-muted-foreground transition-colors"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Field Content */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-800/50">
                                                        {t(`fieldTypes.${field.type === "select" ? "dropdown" : field.type}`)}
                                                    </Badge>
                                                    {field.required && (
                                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50">
                                                            Required
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                                                        onClick={() => toggleEditing(field.id)}
                                                    >
                                                        {field.isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-600"
                                                        onClick={() => removeField(field.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {field.isEditing ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {t("fields.fieldLabel")}
                                                        </Label>
                                                        <Input
                                                            value={field.label}
                                                            onChange={(e) => updateField(field.id, "label", e.target.value)}
                                                            placeholder={t("fields.labelPlaceholder")}
                                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {t("fields.placeholder")}
                                                        </Label>
                                                        <Input
                                                            value={field.placeholder}
                                                            onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                                                            placeholder={t("fields.placeholderText")}
                                                            className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                                        />
                                                    </div>

                                                    {(field.type === "select" || field.type === "radio") && (
                                                        <div className="col-span-full space-y-2">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                {t("fields.options")} (comma separated)
                                                            </Label>
                                                            <Textarea
                                                                value={field.options?.join(", ")}
                                                                onChange={(e) =>
                                                                    updateField(
                                                                        field.id,
                                                                        "options",
                                                                        e.target.value.split(",").map((opt) => opt.trim())
                                                                    )
                                                                }
                                                                placeholder={t("fields.optionsPlaceholder")}
                                                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 min-h-[80px]"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="col-span-full flex items-center gap-3 pt-1">
                                                        <Switch
                                                            checked={field.required}
                                                            onCheckedChange={(checked) => updateField(field.id, "required", checked)}
                                                        />
                                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            Make this field mandatory
                                                        </Label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-lg">{field.label || "Untitled Field"}</p>
                                                    {field.placeholder && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            Placeholder: {field.placeholder}
                                                        </p>
                                                    )}
                                                    {(field.type === "select" || field.type === "radio") && field.options && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.options.map((opt, i) => (
                                                                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-dashed border-white/20 dark:border-slate-700/30 rounded-3xl p-12 text-center">
                            <div className="max-w-xs mx-auto space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto">
                                    <Plus className="h-8 w-8 text-indigo-500/40" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold">{t("preview.noFields")}</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Click an icon above to start building your custom form fields.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* Footer Actions - Stick to bottom */}
            <div className="shrink-0 border-t border-white/10 dark:border-slate-700/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 mt-auto rounded-b-2xl z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium leading-none">Settings apply to all new registrations.</span>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || fields.length === 0}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full px-10 shadow-lg shadow-indigo-500/20 py-6 h-auto transition-all active:scale-95"
                    >
                        {isSaving ? (
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5 mr-3" />
                        )}
                        <span className="font-bold uppercase tracking-widest text-xs">
                            {isSaving ? "Saving..." : t("actions.updateForm")}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
