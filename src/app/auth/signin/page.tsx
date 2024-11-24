// src/app/auth/signin/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/actions"

export default async function SignIn() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Sign in to Trackio
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <form>
            <Button
              formAction={signInWithGoogle}
              className="w-full"
              variant="default"
            >
              Sign in with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export const runtime = "nodejs"