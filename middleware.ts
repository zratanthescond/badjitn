import { authMiddleware } from "@clerk/nextjs";
import { connectToDatabase } from "./lib/database";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

export default authMiddleware({
  async afterAuth(auth, req: NextRequest) {
    console.log(auth.userId, "User ID from auth middleware");
    try {
      const user = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users?clerkId=${auth.userId}`
      );
      const location = req.nextUrl.pathname.match(/\/([^/]+)/)?.[0] || "";
      if (user.data && user.data.isBanned && location !== "banned") {
        if (location !== "sign-in")
          return NextResponse.redirect(
            process.env.NEXT_PUBLIC_SERVER_URL + "/banned"
          );
      }
      console.log("User data:", user.data);
      console.log("Location:", location);
      console.log(
        "pathname:",
        req.nextUrl.pathname.split("/") || "No pathname"
      );
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
    }
  },
  publicRoutes: [
    "/",
    "/events/:id",
    "/api/webhook/clerk",
    "/api/webhook/fileServer",
    "/api/webhook/stripe",
    "/api/uploadthing",
    "/banned",
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/api/webhook/fileServer",
    "/api/uploadthing",
    "/api/users",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
