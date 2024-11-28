// src/components/auth/SignupForm.tsx
"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    })
    
    if (res.ok) {
      router.push("/auth/login")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        required
      />
      <Button type="submit" className="w-full">Sign Up</Button>
      <p className="text-center text-gray-400">
        Already have an account? <Link href="/auth/login" className="text-blue-500">Login</Link>
      </p>
    </form>
  )
}
