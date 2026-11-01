import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Extracts tenant (client back office) slug from <slug>.pro.localhost,
// <slug>.pro.lvh.me (local dev) or <slug>.pro.badgi.net (prod)
function extractTenantSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]; // strip port
  const suffixes = [".pro.localhost", ".pro.lvh.me", ".pro.badgi.net"];
  for (const suffix of suffixes) {
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      // single label only: a.b.pro.badgi.net is not a valid tenant
      return sub && !sub.includes(".") ? sub : null;
    }
  }
  return null;
}

// Extracts org slug from *.localhost, *.lvh.me (local dev) or *.badgi.net (prod)
function extractOrgSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]; // strip port
  const SKIP = ["www", "api", "app", "localhost", "badgi", "pro"];

  const suffixes = [".localhost", ".lvh.me", ".badgi.net"];
  for (const suffix of suffixes) {
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      // multi-level hosts (e.g. x.pro) never map to an organisation
      return sub && !sub.includes(".") && !SKIP.includes(sub) ? sub : null;
    }
  }
  return null;
}

const isPublicRoute = createRouteMatcher([
  /^\/(?:[a-z]{2}\/)?$/,
  /^\/(?:[a-z]{2}\/)?events\/?$/,
  /^\/(?:[a-z]{2}\/)?events\/(?!create|update$)[^/]+\/?$/,
  /^\/(?:[a-z]{2}\/)?events\/[^/]+\/submit-work\/?$/,
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
  /^\/(?:[a-z]{2}\/)?certificates\/[^/]+\/?$/,
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

  // Client (tenant) back office: <slug>.pro.badgi.net -> /pro/<slug>/...
  // Must run before the organisation subdomain branch.
  const tenantSlug = extractTenantSubdomain(host);
  if (tenantSlug) {
    const { pathname, search } = req.nextUrl;
    const isPassthrough =
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      /^\/(?:[a-z]{2}\/)?sign-(in|up)/.test(pathname);
    if (isPassthrough) return NextResponse.next();

    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    // Already prefixed (e.g. internal navigation): do not double-prefix.
    if (pathname === `/pro/${tenantSlug}` || pathname.startsWith(`/pro/${tenantSlug}/`)) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = `/pro/${tenantSlug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // The tenant back office is only reachable through its subdomain.
  if (req.nextUrl.pathname === "/pro" || req.nextUrl.pathname.startsWith("/pro/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

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
