"use client";
import React from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "../ui/button";

export default function SocialLogin() {
  const doSocialLogin = async (formData: FormData) => {
    // Social login action placeholder - preserved as per original logic
    const action = formData.get("action");
    console.log("Social login action:", action);
  };

  return (
    <div className="w-full">
      <form action={doSocialLogin}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <Button
            type="submit"
            name="action"
            value="google"
            className="h-12 w-full rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 group flex items-center justify-center gap-2"
          >
            <FaGoogle className="size-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Google</span>
          </Button>
          
          <Button
            type="submit"
            name="action"
            value="facebook"
            className="h-12 w-full rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 group flex items-center justify-center gap-2"
          >
            <FaFacebook className="size-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Facebook</span>
          </Button>

          <Button
            type="submit"
            name="action"
            value="twitter"
            className="h-12 w-full rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-sky-500/50 transition-all duration-300 group flex items-center justify-center gap-2"
          >
            <FaXTwitter className="size-5 text-white group-hover:scale-110 transition-transform" />
            <span className="font-medium">X.com</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
