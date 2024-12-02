// src/components/HabitList.tsx
"use client";

import { useState, useCallback } from "react";
import type { Habit, HabitStats, HabitUpdateInput } from "@/types/habit";
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

interface MonthlyHabitViewProps {
  habits: Habit[];
}

function MonthlyHabitView({ habits }: MonthlyHabitViewProps): JSX.Element {
  const { toggleHabit } = useOptimisticHabits();
  return <MonthlyView habits={habits} onToggleHabit={toggleHabit} />;
}

export function HabitList({ habits: initialHabits }: HabitListProps): JSX.Element {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const router = useRouter();

  const handleDelete = useCallback(async (habitId: string): Promise<void> => {
    setHabits(current => current.filter(h => h.id !== habitId));
    
    const toastId = toast.loading("Deleting habit...");
    
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete habit");
      }
      
      toast.success("Habit deleted successfully", { id: toastId });
      router.refresh();
    } catch (error) {
      console.error("Error deleting habit:", error);
      setHabits(initialHabits);
      toast.error("Failed to delete habit", { id: toastId });
    }
  }, [initialHabits, router]);

  const handleUpdate = useCallback(async (habitId: string, data: Partial<HabitUpdateInput>): Promise<void> => {
    setHabits(current =>
      current.map(habit =>
        habit.id === habitId
          ? { ...habit, ...data }
          : habit
      )
    );

    const toastId = toast.loading("Updating habit...");

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit");
      }

      toast.success("Habit updated successfully", { id: toastId });
      router.refresh();
    } catch (error) {
      console.error("Error updating habit:", error);
      setHabits(initialHabits);
      toast.error("Failed to update habit", { id: toastId });
    }
  }, [initialHabits, router]);

  const handleCreateHabit = useCallback(() => {
    const element = document.getElementById('new-habit-trigger');
    if (element) {
      element.click();
    }
  }, []);

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
          onClick={handleCreateHabit}
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
            onClick={handleCreateHabit}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Habit
          </Button>
        </motion.div>
      </motion.div>
    </OptimisticProvider>
  );
}