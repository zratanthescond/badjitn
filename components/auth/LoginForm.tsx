"use client";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import SocialLogin from "./SocialLogin";

const Icons = {
  spinner: Loader2,
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative background glass elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />

        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <>
                <SignIn.Step name="start">
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glass border">
                    <CardHeader className="space-y-1 text-center pt-8">
                      <CardTitle className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                        Welcome Back
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Sign in to your account to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 px-8">
                      {/* Social Login integration - keeping user's logic foundation */}
                      <SocialLogin />

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#0f172a] px-2 text-gray-500 backdrop-blur-sm rounded-full">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Clerk.Field name="identifier" className="space-y-2">
                          <Clerk.Label className="text-sm font-medium text-gray-300 ml-1">
                            Email address
                          </Clerk.Label>
                          <Clerk.Input type="email" required asChild>
                            <Input className="h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:ring-indigo-500/50 transition-all focus:border-indigo-500/50" placeholder="name@example.com" />
                          </Clerk.Input>
                          <Clerk.FieldError className="text-xs text-red-400 mt-1 ml-1" />
                        </Clerk.Field>

                        <SignIn.Action submit asChild>
                          <Button 
                            disabled={isGlobalLoading} 
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-95"
                          >
                            <Clerk.Loading>
                              {(isLoading) => isLoading ? <Icons.spinner className="size-5 animate-spin" /> : "Continue"}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-8 pt-2">
                      <div className="text-center text-sm text-gray-400">
                        Don&apos;t have an account?
                      </div>
                      <Button variant="outline" size="lg" className="w-full border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 rounded-2xl transition-all duration-300 hover:border-indigo-500/50" asChild>
                        <Clerk.Link navigate="sign-up">
                          Create an account
                        </Clerk.Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </SignIn.Step>

                <SignIn.Step name="choose-strategy">
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glass border">
                    <CardHeader className="space-y-1 text-center pt-8">
                      <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Use another method
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Facing issues? You can use any of these methods to sign in.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 px-8 pb-8">
                      <SignIn.SupportedStrategy name="email_code" asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isGlobalLoading}
                          className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
                        >
                          Email code
                        </Button>
                      </SignIn.SupportedStrategy>
                      <SignIn.SupportedStrategy name="password" asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isGlobalLoading}
                          className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
                        >
                          Password
                        </Button>
                      </SignIn.SupportedStrategy>
                      <SignIn.Action navigate="previous" asChild>
                        <Button 
                          variant="ghost" 
                          disabled={isGlobalLoading}
                          className="w-full h-12 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl mt-2"
                        >
                          Go back
                        </Button>
                      </SignIn.Action>
                    </CardContent>
                  </Card>
                </SignIn.Step>

                <SignIn.Step name="verifications">
                  <SignIn.Strategy name="password">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glass border">
                      <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                          Enter Password
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Welcome back to your event platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-6 px-8 flex-col flex items-center justify-center">
                        <Clerk.Field name="password" className="space-y-2 w-full">
                          <Clerk.Label className="text-sm font-medium text-gray-300 ml-1">
                            Password
                          </Clerk.Label>
                          <Clerk.Input type="password" required asChild>
                            <Input className="h-12 bg-white/5 border-white/10 rounded-2xl text-white focus:ring-indigo-500/50 transition-all" />
                          </Clerk.Input>
                          <Clerk.FieldError className="text-xs text-red-400 mt-1 ml-1" />
                        </Clerk.Field>

                        <SignIn.Action submit asChild>
                          <Button 
                            disabled={isGlobalLoading} 
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-95"
                          >
                            <Clerk.Loading>
                              {(isLoading) => isLoading ? <Icons.spinner className="size-5 animate-spin" /> : "Continue"}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                        
                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button type="button" variant="link" className="text-indigo-400 hover:text-indigo-300 pt-1">
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </CardContent>
                    </Card>
                  </SignIn.Strategy>

                  <SignIn.Strategy name="email_code">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glass border">
                      <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                          Check your email
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Enter the code we sent to your address
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-6 px-8">
                        <Clerk.Field name="code" className="space-y-4">
                          <Clerk.Label className="sr-only">Verification code</Clerk.Label>
                          <div className="flex justify-center flex-col items-center">
                            <Clerk.Input
                              type="otp"
                              autoSubmit
                              className="flex gap-2 has-[:disabled]:opacity-50"
                              render={({ value, status }) => (
                                <div
                                  data-status={status}
                                  className="relative flex h-12 w-10 items-center justify-center border border-white/10 bg-white/5 text-lg font-semibold text-white shadow-sm transition-all first:rounded-l-2xl last:rounded-r-2xl data-[status=selected]:ring-2 data-[status=selected]:ring-indigo-500/50 data-[status=cursor]:ring-1 data-[status=cursor]:ring-indigo-500/50"
                                >
                                  {value}
                                </div>
                              )}
                            />
                            <Clerk.FieldError className="text-xs text-red-400 mt-2 text-center" />
                          </div>
                          
                          <SignIn.Action
                            asChild
                            resend
                            fallback={({ resendableAfter }) => (
                              <Button variant="link" size="sm" disabled className="w-full text-gray-500">
                                Resend code in <span className="tabular-nums font-mono ml-1">{resendableAfter}s</span>
                              </Button>
                            )}
                          >
                            <Button variant="link" size="sm" className="w-full text-indigo-400 hover:text-indigo-300">
                              Didn&apos;t receive a code? Resend
                            </Button>
                          </SignIn.Action>
                        </Clerk.Field>

                        <SignIn.Action submit asChild>
                          <Button 
                            disabled={isGlobalLoading} 
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-95"
                          >
                            <Clerk.Loading>
                              {(isLoading) => isLoading ? <Icons.spinner className="size-5 animate-spin" /> : "Continue"}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                        
                        <SignIn.Action navigate="choose-strategy" asChild>
                          <Button size="sm" variant="link" className="text-indigo-400 hover:text-indigo-300 pt-1">
                            Use another method
                          </Button>
                        </SignIn.Action>
                      </CardContent>
                    </Card>
                  </SignIn.Strategy>
                </SignIn.Step>

                {/* SSO Callback Step */}
                <SignIn.Step name="sso-callback">
                  <div className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                    <Icons.spinner className="size-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-white font-medium">Completing sign in...</p>
                  </div>
                </SignIn.Step>
              </>
            )}
          </Clerk.Loading>
        </SignIn.Root>
      </div>
    </div>
  );
}
