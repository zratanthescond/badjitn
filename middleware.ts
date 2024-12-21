import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./app/auth.config";
import NextAuth from "next-auth";

//const { auth } = NextAuth(authConfig);

import {
  PUBLIC_ROUTES,
  LOGIN,
  ROOT,
  PROTECTED_SUB_ROUTES,
  SIGN_UP,
} from "./lib/route";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  // const session = await auth();
  // console.log(session);
  // const isAuthenticated = !!session?.user;
  // console.log(isAuthenticated, nextUrl.pathname);
  // const isPublicRoute =
  //   (PUBLIC_ROUTES.find((route: string) =>
  //     nextUrl.pathname.startsWith(route)
  //   ) ||
  //     nextUrl.pathname === ROOT) &&
  //   !PROTECTED_SUB_ROUTES.find((route: string) =>
  //     nextUrl.pathname.includes(route)
  //   );
  // console.log(isPublicRoute);
  // if (!isAuthenticated && !isPublicRoute)
  //   return Response.redirect(new URL(LOGIN, nextUrl));
  // if (
  //   isAuthenticated &&
  //   (nextUrl.pathname.startsWith(SIGN_UP) || nextUrl.pathname.startsWith(LOGIN))
  // )
  return NextResponse.rewrite(new URL(nextUrl));
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
