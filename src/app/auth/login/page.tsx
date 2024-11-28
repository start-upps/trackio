// src/app/auth/login/page.tsx:
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Login</h2>
        <p className="mt-2 text-gray-400">Welcome back to Trackio</p>
      </div>
      <LoginForm />
    </div>
  )
}