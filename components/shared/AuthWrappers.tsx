"use client";

import { useAuth } from "@clerk/nextjs";
import React from "react";

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded || !isSignedIn) {
    return null;
  }
  
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded || isSignedIn) {
    return null;
  }
  
  return <>{children}</>;
}
