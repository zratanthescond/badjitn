"use client";
import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import type { PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Animated background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -80, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-pink-600/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              y: [0, -150, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-sky-600/10 rounded-full blur-[150px]"
          />
        </div>

        {/* Dotted pattern overlay */}
        <div className="absolute inset-0 bg-dotted-pattern opacity-[0.03] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full flex items-center justify-center py-12"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </ReactQueryProvider>
  );
};

export default AuthLayout;
