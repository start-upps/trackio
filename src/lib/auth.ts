// src/lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./db"
import { NextAuthConfig } from "next-auth"

export const config = {
  adapter: PrismaAdapter(db),
  providers: [Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  })],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id }
    })
  }
} satisfies NextAuthConfig

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(config)