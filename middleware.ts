import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const isPublicRoute = createRouteMatcher([
  "/",
  "/events(.*)",
  "/api/webhook/clerk(.*)",
  "/api/webhook/fileServer(.*)",
  "/api/webhook/stripe(.*)",
  "/api/uploadthing(.*)",
  "/api/upload-bank-transfer(.*)",
  "/banned(.*)",
  "/organisations(.*)",
  "/forms(.*)",
  "/api/users(.*)",
  "/api/events(.*)",
  "/sign-in(.*)"
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
