export const LOGIN = "/sign-in";
export const SIGN_UP = "/sign-up";
export const ROOT = "/";

export const PUBLIC_ROUTES = [
  "/",
  "/events/:id",
  "/api/webhook/clerk",
  "/api/webhook/stripe",
  "/api/uploadthing",
  "/api/auth/activate/:token",
  "/sign-in",
  "/sign-up",
  "/api/auth/session",
  "/api/auth/callback/facebook",
];

export const PROTECTED_SUB_ROUTES = ["/checkout", "/home"];
