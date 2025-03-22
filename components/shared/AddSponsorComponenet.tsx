"use client";

import type React from "react";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSponsor } from "@/lib/actions/sponsor.action";
import { toast } from "@/hooks/use-toast";

const sponsorFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Sponsor name must be at least 2 characters." }),
  logo: z
    .instanceof(File, { message: "A valid file is required" })
    .refine((file) => file.size <= 1000000, "File size must be less than 1MB")
    .optional(), // This will store the data URL of the uploaded image
  website: z.string().url({ message: "Please enter a valid URL." }),
  tier: z.string({
    required_error: "Please select a sponsorship tier.",
  }),
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

const defaultValues: Partial<SponsorFormValues> = {
  logo: "",
};

// Mock data for sponsors

export default function SponsorForm({ userId }: { userId: string }) {
  const [sponsors, setSponsors] = useState([]);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues,
  });

  async function onSubmit(data: SponsorFormValues) {
    // Add the new sponsor to the list
    alert("form submitted");
    console.log(data);
    const formdata = new FormData();
    formdata.append("name", data.name);
    formdata.append("tier", data.tier);
    formdata.append("website", data.website);
    formdata.append("creator", userId);
    if (data.logo !== undefined) {
      formdata.append("logo", data.logo);
    }
    const result = await createSponsor(formdata);

    if (result && result.success) {
      toast({
        title: "Success",
        description: "Sponsor added successfully",
        variant: "success",
      });
    }

    // Reset the form
    form.reset();
    setPreview(null);
  }

  return (
    <div className="w-full   mx-auto space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add New Sponsor</CardTitle>
          <CardDescription>
            Enter the details of the new sponsor to add them to your platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { value, onChange, ...fieldProps } }) => {
                    const handleFileChange = (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const result = reader.result as string;
                          setPreview(result);
                          onChange(file); // Store the data URL in form state
                        };
                        reader.readAsDataURL(file);
                      }
                    };

                    return (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                {...fieldProps}
                                className="flex-1"
                              />
                              {preview && (
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                  <img
                                    src={preview || "/placeholder.svg"}
                                    alt="Logo preview"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload your sponsor's logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsorship Tier</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Add Sponsor</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
