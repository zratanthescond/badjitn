"use client";

import { useState, useEffect, useRef } from "react";
import {
    UserPlus,
    Trash2,
    Loader2,
    Shield,
    Crown,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
    addAdminToOrganisation,
    removeAdminFromOrganisation,
} from "@/lib/actions/organisation.actions";
import { searchUsers } from "@/lib/actions/user.actions";
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

interface MemberManagementProps {
    organisationId: string;
    userId: string;
    isCreator: boolean;
    creator: {
        _id: string;
        firstName: string;
        lastName: string;
        photo?: string;
        email?: string;
        username?: string;
    };
    admins: {
        _id: string;
        firstName: string;
        lastName: string;
        photo?: string;
        email?: string;
        username?: string;
    }[];
    onMemberChanged?: () => void;
}

export default function MemberManagement({
    organisationId,
    userId,
    isCreator,
    creator,
    admins,
    onMemberChanged,
}: MemberManagementProps) {
    const [adminIdentifier, setAdminIdentifier] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (adminIdentifier.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchUsers(adminIdentifier.trim());
                // Filter out users who are already admins
                const adminIds = admins.map((a) => a._id);
                const filtered = results.filter(
                    (u: any) => !adminIds.includes(u._id)
                );
                setSuggestions(filtered);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [adminIdentifier, admins]);

    const selectSuggestion = (user: any) => {
        setAdminIdentifier(user.email || user.username);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === "Enter") handleAddAdmin();
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                selectSuggestion(suggestions[highlightedIndex]);
            } else {
                handleAddAdmin();
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!adminIdentifier.trim()) {
            toast({
                title: "Error",
                description: "Please enter an email or username",
                variant: "destructive",
            });
            return;
        }

        setIsAdding(true);
        try {
            const result = await addAdminToOrganisation({
                organisationId,
                userId,
                adminIdentifier: adminIdentifier.trim(),
            });

            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Admin Added!",
                    description: `Successfully added as admin.`,
                });
                setAdminIdentifier("");
                setSuggestions([]);
                onMemberChanged?.();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add admin. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveAdmin = async (adminId: string) => {
        setRemovingId(adminId);
        try {
            const result = await removeAdminFromOrganisation({
                organisationId,
                userId,
                adminId,
            });

            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Admin Removed",
                    description: "The admin has been removed from this organisation.",
                });
                onMemberChanged?.();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove admin.",
                variant: "destructive",
            });
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Admin Section */}
            {isCreator && (
                <div className="glass bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-700/30 rounded-2xl p-5">
                    <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add Admin
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Search for a user by name, email, or username to add as admin.
                    </p>
                    <div className="flex gap-3">
                        <div className="flex-1 relative" ref={searchRef}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
                            )}
                            <Input
                                className="pl-10 glass rounded-xl"
                                placeholder="Search by name, email, or username..."
                                value={adminIdentifier}
                                onChange={(e) => setAdminIdentifier(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                autoComplete="off"
                            />
                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-border/60 rounded-xl shadow-xl max-h-[280px] overflow-y-auto">
                                    {suggestions.map((user: any, index: number) => (
                                        <button
                                            key={user._id}
                                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${index === highlightedIndex
                                                    ? "bg-indigo-50 dark:bg-indigo-950/30"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                } ${index === 0 ? "rounded-t-xl" : ""} ${index === suggestions.length - 1 ? "rounded-b-xl" : ""
                                                }`}
                                            onClick={() => selectSuggestion(user)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                        >
                                            <Avatar className="h-8 w-8 border border-border/30">
                                                <AvatarImage src={user.photo} />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                                                    {user.firstName?.[0]}
                                                    {user.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user.email} {user.username ? `(@${user.username})` : ""}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showSuggestions && suggestions.length === 0 && adminIdentifier.trim().length >= 2 && !isSearching && (
                                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-border/60 rounded-xl shadow-xl px-4 py-3 text-center">
                                    <p className="text-sm text-muted-foreground">No users found. You can still type the exact email or username.</p>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleAddAdmin}
                            disabled={isAdding || !adminIdentifier.trim()}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl px-6"
                        >
                            {isAdding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}


            {/* Members List */}
            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-500" />
                    Members ({admins.length})
                </h3>

                <div className="space-y-2">
                    {admins.map((admin) => {
                        const isOwner = admin._id === creator._id;
                        return (
                            <div
                                key={admin._id}
                                className="flex items-center gap-3 p-3 glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/30 group hover:border-indigo-200/50 dark:hover:border-indigo-700/50 transition-all"
                            >
                                <Avatar className="h-10 w-10 border-2 border-white/50 dark:border-slate-700/50">
                                    <AvatarImage src={admin.photo} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                                        {admin.firstName?.[0]}
                                        {admin.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm truncate">
                                            {admin.firstName} {admin.lastName}
                                        </span>
                                        {isOwner ? (
                                            <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs gap-1">
                                                <Crown className="h-3 w-3" />
                                                Owner
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs gap-1">
                                                <Shield className="h-3 w-3" />
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate block">
                                        {admin.email || admin.username || ""}
                                    </span>
                                </div>

                                {/* Remove button (only for creator, can't remove themselves) */}
                                {isCreator && !isOwner && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                                            >
                                                {removingId === admin._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Admin</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove{" "}
                                                    <strong>
                                                        {admin.firstName} {admin.lastName}
                                                    </strong>{" "}
                                                    from this organisation? They will lose access to
                                                    manage events.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl">
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemoveAdmin(admin._id)}
                                                    className="bg-red-500 hover:bg-red-600 rounded-xl"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
