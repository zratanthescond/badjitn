import { authMiddleware } from "@clerk/nextjs";
import { connectToDatabase } from "./lib/database";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

export default authMiddleware({
  async afterAuth(auth, req: NextRequest) {
    try {
      const user = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users?clerkId=${auth.userId}`
      );
      const location = req.nextUrl.pathname.split("/").pop();
      if (user.data && user.data.isBanned && location !== "banned") {
        if (location !== "sign-in")
          return NextResponse.redirect(
            process.env.NEXT_PUBLIC_SERVER_URL + "/banned"
          );
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
