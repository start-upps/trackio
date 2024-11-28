// src/app/auth/signin/page.tsx
import { SignInButton } from "@/components/SignInButton";

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Sign in to Trackio
        </h2>
        <SignInButton />
      </div>
    </div>
  );
}