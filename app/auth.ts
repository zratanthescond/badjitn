import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import twitter from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import { MongoClient } from "mongodb";
import { IUser } from "@/lib/database/models/user.model";
/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */

const client = new MongoClient(process.env.MONGODB_URI || "");
const clientPromise = client.connect();

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log(credentials);
        if (credentials === null) return null;

        try {
          const user: IUser = await authOptions?.adapter?.getUserByEmail(
            credentials.email
          );
          console.log("user", user);

          if (!user) {
            return null;
          }
          return user;
        } catch (e) {
          console.log("******************************************************");
          console.error(e);
          console.log("******************************************************");
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      console.log(account);
      if (user) {
        token.uid = user;
      }

      return token;
    },
    session: async ({ session, token }) => {
      // here we put session.useData and put inside it whatever you want to be in the session
      // here try to console.log(token) and see what it will have
      // sometimes the user get stored in token.uid.userData
      // sometimes the user data get stored in just token.uid
      //console.log("account", account);
      //console.log("token", token);
      token.uid.password = null;
      session.userData = token.uid;

      return session;
    },
  },

  secret: process.env.NEXT_AUTH_SECRET,
  database: process.env.DB_URL,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
