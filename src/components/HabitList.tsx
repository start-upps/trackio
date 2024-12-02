// src/components/HabitList.tsx
"use client";

import { useState } from "react";
import type { Habit, HabitStats } from "@/types/habit";
import { OptimisticProvider } from "./providers/OptimisticProvider";
import { motion } from "framer-motion";
import { Plus, ListPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MonthlyView from "./MonthlyHabitTracker";
import { useOptimisticHabits } from "./providers/OptimisticProvider";

interface HabitListProps {
  habits: Habit[];
  initialStats?: Record<string, HabitStats>;
}

function MonthlyHabitView({ habits }: { habits: Habit[] }) {
  const { toggleHabit } = useOptimisticHabits();
  return <MonthlyView habits={habits} onToggleHabit={toggleHabit} />;
}

export function HabitList({ habits: initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState(initialHabits);
  const router = useRouter();

  const handleDelete = async (habitId: string) => {
    // Optimistic update
    setHabits(current => current.filter(h => h.id !== habitId));
    
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }
      
      toast.success("Habit deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting habit:", error);
      setHabits(initialHabits);
      toast.error("Failed to delete habit");
    }
  };

  const handleUpdate = async (habitId: string, data: Partial<Habit>) => {
    // Optimistic update
    setHabits(current =>
      current.map(habit =>
        habit.id === habitId
          ? { ...habit, ...data }
          : habit
      )
    );

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit");
      }

      toast.success("Habit updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
      setHabits(initialHabits);
      toast.error("Failed to update habit");
    }
  };

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6"
        >
          <ListPlus className="w-8 h-8 text-gray-400" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-300 mb-3">
          No habits tracked yet
        </h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Start building better habits by creating your first habit tracker.
          Click the + button above to begin.
        </p>
        <Button 
          size="lg"
          className="rounded-xl bg-gray-800 hover:bg-gray-700"
          onClick={() => window.document.getElementById('new-habit-trigger')?.click()}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Habit
        </Button>
      </motion.div>
    );
  }

  return (
    <OptimisticProvider habits={habits}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <MonthlyHabitView habits={habits} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center py-4"
        >
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-400"
            onClick={() => window.document.getElementById('new-habit-trigger')?.click()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Habit
          </Button>
        </motion.div>
      </motion.div>
    </OptimisticProvider>
  );
}