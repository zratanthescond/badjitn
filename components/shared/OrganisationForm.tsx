"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Building2, Globe, Link as LinkIcon, Globe2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
    createOrganisation,
    updateOrganisation,
} from "@/lib/actions/organisation.actions";
import { ImageUploader } from "./ImageUploader";

const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const organisationSchema = z.object({
    name: z.string().min(2, "Organisation name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    website: z
        .string()
        .url("Please enter a valid URL")
        .or(z.literal(""))
        .optional(),
    subdomain: z
        .string()
        .max(30, "Maximum 30 caractères")
        .refine((v) => !v || subdomainRegex.test(v), {
            message: "Uniquement des lettres minuscules, chiffres et tirets (ex: awgho)",
        })
        .optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
});

type OrganisationFormValues = z.infer<typeof organisationSchema>;

interface OrganisationFormProps {
    userId: string;
    type: "Create" | "Update";
    organisation?: {
        _id: string;
        name: string;
        description: string;
        website?: string;
        subdomain?: string;
        logo?: string;
        coverImage?: string;
        socialLinks?: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
        };
    };
}

export default function OrganisationForm({
    userId,
    type,
    organisation,
}: OrganisationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OrganisationFormValues>({
        resolver: zodResolver(organisationSchema),
        defaultValues: {
            name: organisation?.name || "",
            description: organisation?.description || "",
            website: organisation?.website || "",
            subdomain: organisation?.subdomain || "",
            logo: organisation?.logo || "",
            coverImage: organisation?.coverImage || "",
            facebook: organisation?.socialLinks?.facebook || "",
            twitter: organisation?.socialLinks?.twitter || "",
            instagram: organisation?.socialLinks?.instagram || "",
            linkedin: organisation?.socialLinks?.linkedin || "",
        },
    });

    const onSubmit = async (values: OrganisationFormValues) => {
        setIsSubmitting(true);
        try {
            if (type === "Create") {
                const newOrg = await createOrganisation({
                    userId,
                    name: values.name,
                    description: values.description,
                    website: values.website,
                    subdomain: values.subdomain || undefined,
                    logo: values.logo,
                    coverImage: values.coverImage,
                    socialLinks: {
                        facebook: values.facebook,
                        twitter: values.twitter,
                        instagram: values.instagram,
                        linkedin: values.linkedin,
                    },
                });

                if (newOrg) {
                    toast({
                        title: "Organisation Created!",
                        description: "Your organisation has been created successfully.",
                    });
                    router.push(`/organisations/${newOrg.slug}`);
                }
            } else if (type === "Update" && organisation) {
                const updatedOrg = await updateOrganisation({
                    organisationId: organisation._id,
                    userId,
                    updateData: {
                        name: values.name,
                        description: values.description,
                        website: values.website,
                        subdomain: values.subdomain || undefined,
                        logo: values.logo,
                        coverImage: values.coverImage,
                        socialLinks: {
                            facebook: values.facebook,
                            twitter: values.twitter,
                            instagram: values.instagram,
                            linkedin: values.linkedin,
                        },
                    },
                });

                if (updatedOrg) {
                    toast({
                        title: "Organisation Updated!",
                        description: "Your changes have been saved.",
                    });
                    router.push(`/organisations/${updatedOrg.slug}`);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-indigo-100/50 dark:border-indigo-900/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                        <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-indigo-800 dark:text-indigo-200">
                            {type === "Create"
                                ? "Create Organisation"
                                : "Update Organisation"}
                        </CardTitle>
                        <CardDescription className="text-indigo-600 dark:text-indigo-300 text-lg">
                            {type === "Create"
                                ? "Set up your organisation to start publishing events"
                                : "Update your organisation details"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Cover Image */}
                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            aspectRatio="wide"
                                            label="Cover Image"
                                            placeholder="Upload a cover image for your organisation"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Logo + Name side-by-side */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <FormField
                                control={form.control}
                                name="logo"
                                render={({ field }) => (
                                    <FormItem className="shrink-0">
                                        <FormControl>
                                            <ImageUploader
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                aspectRatio="square"
                                                label="Logo"
                                                placeholder="Upload logo"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex-1 space-y-4 w-full">
                                {/* Organisation Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-indigo-500" />
                                                Organisation Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="Enter your organisation name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Website */}
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-indigo-500" />
                                                Website
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="https://your-organisation.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Subdomain */}
                                <FormField
                                    control={form.control}
                                    name="subdomain"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                                <Globe2 className="h-4 w-4 text-indigo-500" />
                                                Sous-domaine Badgi
                                                <span className="text-muted-foreground font-normal">(optionnel)</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center rounded-xl overflow-hidden border border-input bg-white/60 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-indigo-400">
                                                    <Input
                                                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none lowercase"
                                                        placeholder="awgho"
                                                        {...field}
                                                        onChange={(e) => {
                                                            const v = e.target.value
                                                                .toLowerCase()
                                                                .replace(/\s+/g, "-")
                                                                .replace(/[^a-z0-9-]/g, "");
                                                            field.onChange(v);
                                                        }}
                                                    />
                                                    <span className="px-3 py-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 border-l border-input whitespace-nowrap select-none">
                                                        .badgi.net
                                                    </span>
                                                </div>
                                            </FormControl>
                                            {field.value && subdomainRegex.test(field.value) && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                                    Votre page sera accessible à{" "}
                                                    <strong>{field.value}.badgi.net</strong>
                                                </p>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your organisation, what you do, and what kind of events you organise..."
                                            className="min-h-[120px] glass rounded-xl resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-indigo-500" />
                                Social Links
                                <span className="text-muted-foreground font-normal">(optional)</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="facebook"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-muted-foreground">
                                                Facebook
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="https://facebook.com/..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="twitter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-muted-foreground">
                                                Twitter / X
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="https://x.com/..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="instagram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-muted-foreground">
                                                Instagram
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="https://instagram.com/..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="linkedin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs text-muted-foreground">
                                                LinkedIn
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-field glass rounded-xl"
                                                    placeholder="https://linkedin.com/company/..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-12 text-base font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {type === "Create" ? "Creating..." : "Updating..."}
                                </>
                            ) : (
                                <>
                                    <Building2 className="mr-2 h-5 w-5" />
                                    {type === "Create"
                                        ? "Create Organisation"
                                        : "Save Changes"}
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
