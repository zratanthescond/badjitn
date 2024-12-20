import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userData?: {
      id?: string;
      email: string;
      username: string;
      phoneNumber: string;
      createdAt: Date;
      password: string;
      emailTocken: string;
      isActive: boolean;
      new: boolean;
      __v?: number;
    };
  }
}
