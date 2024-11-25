// src/components/HabitList.tsx
"use client"

import { HabitCard } from "./HabitCard"
import type { Habit } from "@/types/habit"
import { OptimisticProvider } from "./providers/OptimisticProvider"
import { motion, AnimatePresence } from "framer-motion"

interface HabitListProps {
  habits: Habit[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h3 className="text-lg font-medium text-gray-400 mb-4">
          No habits tracked yet
        </h3>
        <p className="text-gray-500">
          Create your first habit to start tracking your progress
        </p>
      </motion.div>
    )
  }

  return (
    <OptimisticProvider habits={habits}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HabitCard habit={habit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </OptimisticProvider>
  )
}