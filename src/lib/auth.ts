// src/lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./db"
import type { Session, User, DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    session({ session, user }: { session: Session; user: User }) {
      if (session.user && user.id) {
        session.user.id = user.id;
      }
      return session;
    }
  }
}

export const { auth, signIn, signOut } = NextAuth(authOptions)