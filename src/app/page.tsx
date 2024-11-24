// src/app/page.tsx
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HabitCard } from "@/components/HabitCard"
import prisma from "@/lib/prisma"

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/api/auth/signin")
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id
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
    <main className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trackio</h1>
        <div className="flex gap-4">
          {/* Add settings and new habit buttons here */}
        </div>
      </div>
      
      <div className="space-y-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={async (habitId, date) => {
              'use server'
              // Toggle logic will be implemented in client component
            }}
          />
        ))}
      </div>
    </main>
  )
}