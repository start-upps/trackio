// src/components/HabitList.tsx
"use client";

import { useState } from "react";
import { HabitCard } from "./HabitCard";
import type { Habit, HabitStats } from "@/types/habit";
import { OptimisticProvider } from "./providers/OptimisticProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HabitListProps {
  habits: Habit[];
  initialStats?: Record<string, HabitStats>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const containerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function HabitList({ habits: initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState(initialHabits);
  const router = useRouter();

  const handleDelete = async (habitId: string) => {
    // Optimistically remove the habit from the UI
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
      // Revert optimistic update on error
      setHabits(initialHabits);
      toast.error("Failed to delete habit");
    }
  };

  const handleArchive = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Optimistically update the UI
    setHabits(current =>
      current.map(h =>
        h.id === habitId
          ? { ...h, archived: !h.archived }
          : h
      )
    );

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !habit.archived }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive habit");
      }

      toast.success(habit.archived ? "Habit restored" : "Habit archived");
      router.refresh();
    } catch (error) {
      console.error("Error archiving habit:", error);
      // Revert optimistic update on error
      setHabits(initialHabits);
      toast.error("Failed to update habit");
    }
  };

  const handleUpdate = async (habitId: string, data: Partial<Habit>) => {
    // Optimistically update the UI
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
      // Revert optimistic update on error
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
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              layoutId={habit.id}
              variants={containerItem}
              transition={{ 
                layout: { type: "spring", stiffness: 300, damping: 30 }
              }}
            >
              <HabitCard 
                habit={habit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUpdate={handleUpdate}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {habits.length > 0 && (
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
        )}
      </motion.div>
    </OptimisticProvider>
  );
}