// src/app/page.tsx
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { signInWithGoogle, signOutAction } from "@/lib/auth-actions"

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Trackio</h1>
          <form>
            <Button
              formAction={signInWithGoogle}
              variant="outline"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      entries: {
        orderBy: {
          date: 'desc'
        },
        take: 28
      }
    }
  })

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Trackio</h1>
          <div className="flex gap-4">
            <form>
              <Button
                variant="outline"
                formAction={signOutAction}
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No habits tracked yet</p>
            <Button variant="outline">Create your first habit</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold">{habit.name}</h2>
                <p className="text-gray-400">{habit.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}