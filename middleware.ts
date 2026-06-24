import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  /^\/(?:[a-z]{2}\/)?$/,
  /^\/(?:[a-z]{2}\/)?events\/?$/,
  /^\/(?:[a-z]{2}\/)?events\/(?!create|update$)[^/]+\/?$/,
  "/api/webhook/clerk(.*)",
  "/api/webhook/fileServer(.*)",
  "/api/webhook/stripe(.*)",
  "/api/uploadthing(.*)",
  "/api/upload-bank-transfer(.*)",
  /^\/(?:[a-z]{2}\/)?banned(.*)/,
  /^\/(?:[a-z]{2}\/)?organisations(.*)/,
  /^\/(?:[a-z]{2}\/)?forms(.*)/,
  "/api/users(.*)",
  "/api/events(.*)",
  /^\/(?:[a-z]{2}\/)?sign-in(.*)/,
  /^\/(?:[a-z]{2}\/)?sign-up(.*)/,
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  const url = req.nextUrl;
  if (!isPublicRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      const redirectPath = url.pathname + url.search;
      signInUrl.searchParams.set("redirect_url", redirectPath);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
