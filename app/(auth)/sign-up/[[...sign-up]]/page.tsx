"use client";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Page() {
  const t = useTranslations("authPages.signUp");

  /* ── Intercept Clerk's username input: spaces → underscores ── */
  useEffect(() => {
    const patched = new WeakSet<HTMLInputElement>();

    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;

    const setNativeValue = (input: HTMLInputElement, value: string) => {
      nativeSetter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const patchInput = (input: HTMLInputElement) => {
      if (patched.has(input)) return;
      patched.add(input);

      // Space key → underscore
      input.addEventListener("keydown", (e) => {
        if (e.key !== " ") return;
        e.preventDefault();
        const s = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? s;
        const next = input.value.slice(0, s) + "_" + input.value.slice(end);
        setNativeValue(input, next);
        input.setSelectionRange(s + 1, s + 1);
      });

      // Paste → strip spaces from pasted text
      input.addEventListener("paste", (e) => {
        const raw = e.clipboardData?.getData("text") ?? "";
        const sanitized = raw.replace(/ /g, "_");
        if (sanitized === raw) return; // no spaces, let default paste happen
        e.preventDefault();
        const s = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? s;
        const next = input.value.slice(0, s) + sanitized + input.value.slice(end);
        setNativeValue(input, next);
        input.setSelectionRange(s + sanitized.length, s + sanitized.length);
      });
    };

    const scan = () => {
      document
        .querySelectorAll<HTMLInputElement>(
          'input[name="username"], input[autocomplete="username"], input[id*="username"]'
        )
        .forEach(patchInput);
    };

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    scan(); // handle already-mounted inputs

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto relative px-4 text-center">
      <div className="absolute inset-0 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden glass"
      >
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none border-none p-4",
              headerTitle:
                "text-white text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2",
              headerSubtitle: "text-gray-400 text-sm",
              socialButtonsBlockButton:
                "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl h-12",
              socialButtonsBlockButtonText: "text-white font-medium",
              socialButtonsBlockButtonArrow: "text-white opacity-50",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500 font-medium text-xs",
              formLabel: "text-gray-300 ml-1 mb-1.5 text-sm",
              formInput:
                "bg-white/5 border-white/10 rounded-2xl text-white h-12 focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all placeholder:text-gray-600",
              formButtonPrimary:
                "bg-gradient-to-br from-sky-500 to-indigo-700 hover:from-sky-400 hover:to-indigo-600 text-white transition-all rounded-2xl h-12 font-semibold shadow-xl shadow-sky-500/20 active:scale-[0.98]",
              footer: "hidden",
            },
            variables: {
              colorPrimary: "#0ea5e9",
              colorPrimaryForeground: "white",
            },
          }}
        />

        <div className="px-8 pb-8 pt-2">
          <div className="h-px w-full bg-white/10 mb-8" />
          <div className="flex flex-col items-center gap-4">
            <span className="text-gray-500 text-sm italic font-medium">
              {t("hasAccount")}
            </span>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 hover:text-sky-300 hover:border-sky-500/40 transition-all duration-300"
            >
              <Link href="/sign-in">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
