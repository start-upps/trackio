// src/lib/auth.ts
import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"]
  }
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      // Return to signin page if url is null
      if (!url) return `/auth/signin`

      // Handle relative callbacks
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Handle subdomains
      else if (new URL(url).origin === baseUrl) return url

      return baseUrl
    },
    session({ session, user }: { session: Session; user: { id: string } }) {
      if (session.user && user.id) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(authConfig);