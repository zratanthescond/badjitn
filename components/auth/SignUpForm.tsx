"use client";
import React, { useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaUser, FaPhone } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { PiPasswordFill } from "react-icons/pi";
import SocialLogin from "./SocialLogin";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { signUpFormSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { doRegister } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
function SignUpForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string>("");
  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    console.log(values);
    setServerError("");
    const response = await doRegister(values);
    if (response._id) {
      form.reset();
      router.push("/sign-in");
    }
    if (response.error) {
      setServerError(() => response.error);
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
    <Card className="card backdrop-blur-sm text-primary-content w-5/6  self-center glass">
      <CardHeader className="justify-center items-center">
        <CardTitle className="justify-center items-center text-white font-bold font-s">
          Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex justify-center flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="input input-bordered flex items-center gap-2 ">
                        <Input type="email" placeholder="Email" {...field} />
                        <IoMail className="h-6 w-6" color="white" />
                      </label>
                    </FormControl>
                    <FormDescription>
                      We'll never share your email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="input input-bordered flex items-center gap-2 ">
                        <Input type="text" placeholder="user Name" {...field} />
                        <FaUser className="h-6 w-6" color="white" />
                      </label>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="input input-bordered flex items-center gap-2 ">
                        <Input
                          type="password"
                          placeholder="password"
                          {...field}
                        />
                        <PiPasswordFill className="h-6 w-6" color="white" />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="input input-bordered flex items-center gap-2 ">
                        <Input
                          type="password"
                          placeholder="repeat password"
                          {...field}
                        />
                        <PiPasswordFill className="h-6 w-6" color="white" />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="input input-bordered flex items-center  gap-2">
                        <Input
                          type="text"
                          placeholder="phone Number"
                          {...field}
                        />
                        <FaPhone className="h-6 w-6" color="white" />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="btn backdrop-blur glass text-white">
                Register
              </Button>
              <p className="text-center text-white p-4">
                You have an account ?
                <a
                  className="link link-accent pl-2 text-primary "
                  href="/sign-in"
                >
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </Form>
        <SocialLogin />
      </CardContent>
    </Card>
  );
}

export default SignUpForm;
