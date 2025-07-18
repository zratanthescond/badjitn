"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function NotFound(): JSX.Element {
  const t = useTranslations("notFound");

  const handleGoBack = (): void => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="max-w-lg w-full glass backdrop-blur-xl bg-card/80 border shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Animated 404 Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-primary" />
                </div>
              </div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
              >
                404
              </motion.h1>
            </motion.div>

            {/* Title and Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                {t("description")}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4 mb-8"
            >
              <Button
                asChild
                className="w-full h-12 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium shadow-lg"
              >
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  {t("backToHome")}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full h-12 rounded-full border-2 hover:bg-muted/50 font-medium bg-transparent"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("previousPage")}
              </Button>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mb-8 p-4 bg-muted/30 rounded-2xl"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t("helpText")}
                </span>
              </div>
            </motion.div>

            {/* Useful Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="pt-8 border-t border-border"
            >
              <p className="text-muted-foreground text-sm mb-4 font-medium">
                {t("usefulLinks")}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {t("contact")}
                </Link>
                <Link
                  href="/support"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {t("support")}
                </Link>
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {t("privacy")}
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
