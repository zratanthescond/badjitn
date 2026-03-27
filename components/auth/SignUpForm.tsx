"use client";
import React, { useEffect } from "react";
import { FaUser, FaPhone } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { PiPasswordFill } from "react-icons/pi";
import SocialLogin from "./SocialLogin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { signUpFormSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Placeholder registration logic preserved from original
const doRegister = async (values: any): Promise<any> => {
  console.log("Registering with:", values);
  return { _id: "dummy-id" }; // Simulated success
};

export default function SignUpForm() {
  const { toast } = useToast();
  type SignUpFormValues = z.infer<typeof signUpFormSchema>;
  const form = useForm<SignUpFormValues, any, SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema) as any,
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    setIsSubmitting(true);
    setServerError("");
    try {
      const response = await doRegister(values);
      if (response._id) {
        toast({
          title: "Account created!",
          description: "Welcome to our platform.",
        });
        form.reset();
        router.push("/sign-in");
      }
      if (response.error) {
        setServerError(response.error);
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (serverError) {
      toast({
        title: "Error",
        description: serverError,
        variant: "destructive",
      });
    }
  }, [serverError, toast]);

  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        {/* Decorative background glass elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glass border">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join our community and start creating events
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 px-8">
            <SocialLogin />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f172a] px-2 text-gray-500 backdrop-blur-sm rounded-full">
                  Or sign up with email
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-gray-400 ml-1">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="johndoe" 
                              className="h-11 bg-white/5 border-white/10 rounded-xl text-white pl-10 focus:ring-sky-500/50 transition-all" 
                              {...field} 
                            />
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-gray-400 ml-1">Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="+1 234..." 
                              className="h-11 bg-white/5 border-white/10 rounded-xl text-white pl-10 focus:ring-sky-500/50 transition-all" 
                              {...field} 
                            />
                            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium text-gray-400 ml-1">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="h-11 bg-white/5 border-white/10 rounded-xl text-white pl-10 focus:ring-sky-500/50 transition-all" 
                            {...field} 
                          />
                          <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-gray-400 ml-1">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="h-11 bg-white/5 border-white/10 rounded-xl text-white pl-10 focus:ring-sky-500/50 transition-all" 
                              {...field} 
                            />
                            <PiPasswordFill className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium text-gray-400 ml-1">Confirm</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="h-11 bg-white/5 border-white/10 rounded-xl text-white pl-10 focus:ring-sky-500/50 transition-all" 
                              {...field} 
                            />
                            <PiPasswordFill className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all duration-300 active:scale-95 mt-2"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin mx-auto" /> : "Create Account"}
                </Button>

                <p className="text-center text-sm text-gray-400 pt-2">
                  Already have an account?{" "}
                  <a href="/sign-in" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
                    Sign In
                  </a>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
