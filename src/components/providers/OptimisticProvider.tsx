// src/components/providers/OptimisticProvider.tsx
"use client";

import { createContext, useContext, useOptimistic, useTransition } from "react";
import type { Habit, HabitEntry } from "@/types/habit";
import { toast } from "sonner";

interface OptimisticContextType {
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  isPending: boolean;
}

const OptimisticContext = createContext<OptimisticContextType | null>(null);

export function OptimisticProvider({
  habits: initialHabits,
  children,
}: {
  habits: Habit[];
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [, addOptimisticHabit] = useOptimistic(
    initialHabits,
    (state: Habit[], { habitId, date }: { habitId: string; date: string }) => {
      return state.map((habit) => {
        if (habit.id !== habitId) return habit;

        const existingEntry = habit.entries.find(
          (entry) => entry.date === date,
        );

        if (existingEntry) {
          toast.promise(Promise.resolve(), {
            loading: "Removing habit completion...",
            success: "Habit completion removed",
            error: "Failed to remove habit completion",
          });
          return {
            ...habit,
            entries: habit.entries.filter((entry) => entry.date !== date),
          };
        }

        toast.promise(Promise.resolve(), {
          loading: "Marking habit as complete...",
          success: "Habit marked as complete",
          error: "Failed to mark habit as complete",
        });

        const newEntry: HabitEntry = {
          id: `temp-${date}`,
          date,
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          habitId,
        };

        return {
          ...habit,
          entries: [...habit.entries, newEntry],
        };
      });
    },
  );

  const toggleHabit = async (habitId: string, date: string) => {
    startTransition(async () => {
      addOptimisticHabit({ habitId, date });

      try {
        const response = await fetch(`/api/habits/${habitId}/entries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date }),
        });

        if (!response.ok) {
          throw new Error("Failed to toggle habit");
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error toggling habit:", error);
      }
    });
  };

  return (
    <OptimisticContext.Provider value={{ toggleHabit, isPending }}>
      {children}
    </OptimisticContext.Provider>
  );
}

export function useOptimisticHabits() {
  const context = useContext(OptimisticContext);
  if (!context) {
    throw new Error(
      "useOptimisticHabits must be used within an OptimisticProvider"
    );
  }
  return context;
}