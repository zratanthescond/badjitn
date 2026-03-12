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

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.next();

    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users?clerkId=${userId}`
    );
    const location = req.nextUrl.pathname.match(/\/([^/]+)/)?.[0] || "";
    if (user.data && user.data.isBanned && location !== "/banned") {
      if (location !== "/sign-in")
        return NextResponse.redirect(
          process.env.NEXT_PUBLIC_SERVER_URL + "/banned"
        );
    }

    if (
      (user.data !== null &&
        user.data.role !== "admin" &&
        location === "/cockpit") ||
      (user.data == null && location === "/cockpit")
    ) {
      console.log("Unauthorized access attempt to cockpit");
      return NextResponse.redirect(process.env.NEXT_PUBLIC_SERVER_URL + "/");
    }
    return NextResponse.next();
  } catch (error) {
    console.log(error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
