// src/components/SignInButton.tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export function SignInButton() {
  return (
    <Button 
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full"
    >
      Sign in with Google
    </Button>
  );
}