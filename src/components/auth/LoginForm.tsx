// src/components/auth/LoginForm.tsx
"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookie handling
      })
      
      if (!res.ok) {
        throw new Error(await res.text())
      }

      // Add delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force reload to ensure new auth state is picked up
      window.location.href = '/'
    } catch (error) {
      console.error('Login error:', error)
      // Add error handling UI here
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
      <Button type="submit" className="w-full">Login</Button>
      <p className="text-center text-gray-400">
        Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-500">Sign up</Link>
      </p>
    </form>
  )
}