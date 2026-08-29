import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Extracts org slug from *.localhost, *.lvh.me (local dev) or *.badgi.net (prod)
function extractOrgSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]; // strip port
  const SKIP = ["www", "api", "app", "localhost", "badgi"];

  const suffixes = [".localhost", ".lvh.me", ".badgi.net"];
  for (const suffix of suffixes) {
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      return sub && !SKIP.includes(sub) ? sub : null;
    }
  }
  return null;
}

const isPublicRoute = createRouteMatcher([
  /^\/(?:[a-z]{2}\/)?$/,
  /^\/(?:[a-z]{2}\/)?events\/?$/,
  /^\/(?:[a-z]{2}\/)?events\/(?!create|update$)[^/]+\/?$/,
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/feed.xml",
  "/favicon.ico",
  "/api/og(.*)",
  /^\/(?:[a-z]{2}\/)?about(.*)/,
  /^\/(?:[a-z]{2}\/)?features(.*)/,
  /^\/(?:[a-z]{2}\/)?pricing(.*)/,
  /^\/(?:[a-z]{2}\/)?blog(.*)/,
  /^\/(?:[a-z]{2}\/)?contact(.*)/,
  /^\/(?:[a-z]{2}\/)?careers(.*)/,
  /^\/(?:[a-z]{2}\/)?community(.*)/,
  /^\/(?:[a-z]{2}\/)?documentation(.*)/,
  /^\/(?:[a-z]{2}\/)?help(.*)/,
  /^\/(?:[a-z]{2}\/)?terms(.*)/,
  /^\/(?:[a-z]{2}\/)?privacy(.*)/,
  /^\/(?:[a-z]{2}\/)?cookies(.*)/,
  /^\/(?:[a-z]{2}\/)?gdpr(.*)/,
  /^\/(?:[a-z]{2}\/)?status(.*)/,
  "/api/webhook/clerk(.*)",
  "/api/webhook/fileServer(.*)",
  "/api/webhook/stripe(.*)",
  "/api/cron(.*)",
  "/api/uploadthing(.*)",
  "/api/upload-bank-transfer(.*)",
  /^\/(?:[a-z]{2}\/)?banned(.*)/,
  /^\/(?:[a-z]{2}\/)?organisations(.*)/,
  /^\/(?:[a-z]{2}\/)?forms(.*)/,
  "/api/users(.*)",
  "/api/events(.*)",
  /^\/(?:[a-z]{2}\/)?sign-in(.*)/,
  /^\/(?:[a-z]{2}\/)?sign-up(.*)/,
  /^\/org\/.*/,  // org subdomain pages are always public
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|meta-externalagent/i.test(
    userAgent
  );
  if (isBot) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") ?? "";
  const orgSlug = extractOrgSubdomain(host);

  if (orgSlug) {
    const url = req.nextUrl.clone();
    // Only rewrite the root path to the org homepage.
    // All other paths (/events/[id], /api/*, etc.) are served normally.
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = `/org/${orgSlug}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/feed.xml" ||
    pathname.startsWith("/api/og")
  ) {
    return NextResponse.next();
  }

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
  matcher: [
    "/((?!.*\\..*|_next|api/upload|api/uploadwork).*)",
    "/",
    "/api/:path((?!upload|uploadwork).*)",
    "/trpc(.*)"
  ],
};
