"use client";
import React from "react";
import { IoMail } from "react-icons/io5";
import { PiPasswordFill } from "react-icons/pi";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";
import { useState } from "react";
import { doCredentialLogin } from "@/app/actions";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof loginFormSchema>>({});
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // alert("Login");
    event.preventDefault();
    console.log("event", event);
    try {
      const formData = new FormData(event.currentTarget);

      const response = await doCredentialLogin(formData);

      if (!!response.error) {
        console.error(response.error);
        setError(response.error.message);
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      setError("Check your Credentials");
    }
  }

  return (
    <Card className="card backdrop-blur-sm text-primary-content w-5/6 glass">
      <CardHeader className="justify-center items-center">
        <CardTitle className="justify-center items-center text-white font-bold font-s">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center flex-1 flex-col gap-4">
          <Form {...form}>
            <form
              onSubmit={(event) => onSubmit(event)}
              className="flex flex-col gap-4"
            >
              <label className="input input-bordered flex items-center gap-2">
                <Input
                  type="email"
                  className="grow"
                  name="email"
                  placeholder="Email"
                />
                <IoMail className="h-6 w-6" color="white" />
              </label>

              <label className="input input-bordered flex items-center gap-2 ">
                <Input
                  type="password"
                  name="password"
                  className="grow"
                  placeholder="password"
                />
                <PiPasswordFill className="h-6 w-6" color="white" />
              </label>
              <Button
                type="submit"
                className="btn text-white bg-gradient-to-tl from-indigo-500 to-pink-500  "
              >
                Connect
              </Button>
            </form>
          </Form>
          <p className="text-center text-white">
            You dont have an account ?
            <a className="link link-accent pl-4 text-primary " href="/sign-up">
              Sign Up
            </a>
          </p>

          <SocialLogin />
        </div>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
