"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("authPages.signIn");
  return (
    <div className="w-full max-w-md mx-auto relative px-4 text-center">
      <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden glass"
      >
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none border-none p-4", // Transparent to show parent card
              headerTitle: "text-white text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2",
              headerSubtitle: "text-gray-400 text-sm",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl h-12",
              socialButtonsBlockButtonText: "text-white font-medium",
              socialButtonsBlockButtonArrow: "text-white opacity-50",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500 font-medium text-xs",
              formLabel: "text-gray-300 ml-1 mb-1.5 text-sm",
              formInput: "bg-white/5 border-white/10 rounded-2xl text-white h-12 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-gray-600",
              formButtonPrimary: "bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white transition-all rounded-2xl h-12 font-semibold shadow-xl shadow-indigo-500/20 active:scale-[0.98]",
              footer: "hidden", 
            },
            variables: {
              colorPrimary: "#6366f1",
              colorTextOnPrimaryBackground: "white",
            }
          }}
        />

        {/* Integrated Navigation Area */}
        <div className="px-8 pb-8 pt-2">
          <div className="h-px w-full bg-white/10 mb-8" />
          <div className="flex flex-col items-center gap-4">
            <span className="text-gray-500 text-sm italic font-medium">{t("noAccount")}</span>
            <Button 
              asChild
              variant="outline" 
              className="w-full h-12 rounded-2xl border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 transition-all duration-300"
            >
              <Link href="/sign-up">
                {t("cta")}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
