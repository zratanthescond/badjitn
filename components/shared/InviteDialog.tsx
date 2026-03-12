"use client";

import { useState, useRef } from "react";
import {
    Send,
    Plus,
    Upload,
    X,
    Loader2,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { sendFormInvitations } from "@/lib/actions/eventform.actions";

interface InviteDialogProps {
    formId: string;
    formTitle: string;
    formSlug: string;
    onInvited?: () => void;
    trigger?: React.ReactNode;
}

export default function InviteDialog({
    formId,
    formTitle,
    formSlug,
    onInvited,
    trigger,
}: InviteDialogProps) {
    const [open, setOpen] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [emailList, setEmailList] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formUrl = typeof window !== "undefined"
        ? `${window.location.origin}/forms/${formSlug}`
        : `/forms/${formSlug}`;

    // Add emails from the textarea
    const addEmails = () => {
        const newEmails = emailInput
            .split(/[,;\n]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

        const unique = newEmails.filter((e) => !emailList.includes(e));
        if (unique.length > 0) {
            setEmailList((prev) => [...prev, ...unique]);
            toast({ title: "Added!", description: `${unique.length} email(s) added to the list` });
        } else if (emailInput.trim()) {
            toast({ title: "No new emails", description: "No valid new emails found", variant: "destructive" });
        }
        setEmailInput("");
    };

    const removeEmail = (email: string) => {
        setEmailList((prev) => prev.filter((e) => e !== email));
    };

    const clearAll = () => {
        setEmailList([]);
        setEmailInput("");
    };

    // File upload handler (CSV, TXT, XLSX)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
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

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Send invitations
    const handleSendInvitations = async () => {
        if (emailList.length === 0) return;

        setIsSending(true);
        try {
            const result = await sendFormInvitations({
                formId,
                emails: emailList,
            });

            if (result.success) {
                toast({ title: "Invitations Sent!", description: result.message });
                setEmailList([]);
                setEmailInput("");
                onInvited?.();
                setOpen(false);
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to send invitations", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-700/30"
                    >
                        <Send className="h-3 w-3 mr-1" />
                        Invite
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="max-w-lg bg-card"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Invite Attendees
                </DialogTitle>

                <div className="space-y-4 mt-2">
                    {/* Form info */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/30">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{formTitle}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{formUrl}</p>
                        </div>
                    </div>

                    {/* Email input */}
                    <div>
                        <Label className="text-xs text-muted-foreground">
                            Email Addresses (comma, semicolon, or newline separated)
                        </Label>
                        <Textarea
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder={"email1@example.com\nemail2@example.com\nemail3@example.com"}
                            className="mt-1.5 bg-white/50 dark:bg-slate-800/50 min-h-[100px] font-mono text-sm"
                        />
                    </div>

                    {/* Add / Import buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            type="button"
                            onClick={addEmails}
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={!emailInput.trim()}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add Emails
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            Import from File
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            .csv, .txt, .xlsx
                        </span>
                    </div>

                    {/* Email list */}
                    {emailList.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Recipients ({emailList.length})
                                </p>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/30">
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
                                disabled={isSending}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full"
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                {isSending ? "Sending..." : `Send Invitations to ${emailList.length} recipient${emailList.length > 1 ? "s" : ""}`}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
