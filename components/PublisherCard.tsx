"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreditCard, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { request } from "http";
import {
  checkoutPublisherRequest,
  requestPublisherBadge,
} from "@/lib/actions/user.actions";
import { loadStripe } from "@stripe/stripe-js";
loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
// Base schema for organization details
const organizationSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters"),
  organizationWebsite: z.string().url("Please enter a valid URL"),
  organizationDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

// Request form schema (just organization details)
const requestFormSchema = organizationSchema;

// Purchase form schema (organization details + payment info)

// Types for our form data
type RequestFormValues = z.infer<typeof requestFormSchema>;

export default function PublisherCard({ userId }: { userId: any }) {
  const [activeTab, setActiveTab] = useState<string>("request");

  // Request form
  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      organizationName: "",
      organizationWebsite: "",
      organizationDescription: "",
    },
  });

  // Purchase form
  const purchaseForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      organizationName: "",
      organizationWebsite: "",
      organizationDescription: "",
    },
  });

  const onRequestSubmit = async (data: RequestFormValues) => {
    // console.log(data);
    try {
      // Simulate API request
      await requestPublisherBadge({
        userId: userId,
        organisationName: data.organizationName,
        organisationWebsite: data.organizationWebsite,
        organisationDescription: data.organizationDescription,
      });

      console.log("Request form data:", data);

      toast({
        title: "Request submitted",
        description: "Your publisher request has been submitted for review.",
      });

      //requestForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your request.",
        variant: "destructive",
      });
    }
  };

  const onPurchaseSubmit = async (data: RequestFormValues) => {
    try {
      // Simulate API request
      await checkoutPublisherRequest({
        userId: userId,
        organisationName: data.organizationName,
        organisationWebsite: data.organizationWebsite,
        organisationDescription: data.organizationDescription,
      });

      console.log("Purchase form data:", data);

      toast({
        title: "Purchase successful",
        description: "Your publisher badge has been purchased successfully.",
      });

      purchaseForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem processing your payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-card/50 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Publisher Access</CardTitle>
        <CardDescription>
          you need an admin check to become a publisher and unlock exclusive
          features and content. Request to become a publisher or purchase a
          publisher badge directly.
        </CardDescription>
      </CardHeader>
      <Tabs
        defaultValue="request"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2  rounded-full mx-2">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
        </TabsList>

        {/* Request Tab */}
        <TabsContent value="request">
          <Form {...requestForm}>
            <form
              onSubmit={requestForm.handleSubmit(onRequestSubmit)}
              className="space-y-4"
            >
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={requestForm.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field glass"
                          placeholder="Enter your organization name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="organizationWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Website</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field glass"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={requestForm.control}
                  name="organizationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your organization and why you want to be a publisher"
                          className="min-h-[100px] glass rounded-3xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant={"outline"}
                  className="w-full input-field glass"
                  disabled={requestForm.formState.isSubmitting}
                >
                  {requestForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>

        {/* Purchase Tab */}
        <TabsContent value="purchase">
          <Form {...purchaseForm}>
            <form
              onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)}
              className="space-y-4"
            >
              <CardContent className="space-y-4 pt-4">
                {/* Same organization fields as request form */}
                <FormField
                  control={purchaseForm.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field glass"
                          placeholder="Enter your organization name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={purchaseForm.control}
                  name="organizationWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Website</FormLabel>
                      <FormControl>
                        <Input
                          className="input-field glass"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={purchaseForm.control}
                  name="organizationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your organization and why you want to be a publisher"
                          className="min-h-[100px]  glass rounded-3xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment section */}
                <div className="rounded-lg border p-4 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Publisher Badge</div>
                    <div className="font-bold">$99.00</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get immediate publisher status with our verified badge.
                    Includes all publisher features.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant={"outline"}
                  className="w-full input-field glass"
                  disabled={purchaseForm.formState.isSubmitting}
                >
                  {purchaseForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Badge ($99.00)
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
