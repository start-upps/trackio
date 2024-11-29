// src/components/SignOutButton.tsx
"use client"

import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST"
      })

      if (!response.ok) throw new Error()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost" 
      size="sm"
      className={cn("text-red-400 hover:text-red-500", className)}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}