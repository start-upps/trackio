// src/app/auth/signup/page.tsx

import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Create Account</h2>
        <p className="mt-2 text-gray-400">Start tracking your habits today</p>
      </div>
      <SignupForm />
    </div>
  )
}