// src/components/providers/OptimisticProvider.tsx
"use client";

import { createContext, useContext, useOptimistic, useTransition, useState, useEffect, useCallback } from "react";
import type { Habit, HabitEntry, ToggleHabitResponse, ApiError } from "@/types/habit";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";

interface OptimisticContextType {
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  isPending: boolean;
  retryFailedUpdates: () => Promise<void>;
}

const OptimisticContext = createContext<OptimisticContextType | null>(null);

interface FailedUpdate {
  habitId: string;
  date: string;
  retryCount: number;
}

function getErrorMessage(error: string | ApiError | undefined): string {
  if (!error) return "Failed to update habit";
  if (typeof error === "string") return error;
  return error.message || "Failed to update habit";
}

export function OptimisticProvider({
  habits: initialHabits,
  children,
}: {
  habits: Habit[];
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [failedUpdates, setFailedUpdates] = useState<FailedUpdate[]>([]);
  const router = useRouter();
  
  const [, addOptimisticHabit] = useOptimistic(
    initialHabits,
    (state: Habit[], { habitId, date }: { habitId: string; date: string }) => {
      const targetDate = new Date(date);
      const now = new Date();
      
      if (isBefore(startOfDay(now), startOfDay(targetDate))) {
        toast.error("Cannot mark habits for future dates");
        return state;
      }

      return state.map((habit) => {
        if (habit.id !== habitId) return habit;

        const existingEntry = habit.entries.find(
          (entry) => format(new Date(entry.date), 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd')
        );

        if (existingEntry) {
          toast.loading("Removing habit completion...");
          return {
            ...habit,
            entries: habit.entries.filter((entry) => 
              format(new Date(entry.date), 'yyyy-MM-dd') !== format(targetDate, 'yyyy-MM-dd')
            ),
          };
        }

        toast.loading("Marking habit as complete...");
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

  const addFailedUpdate = useCallback((habitId: string, date: string) => {
    setFailedUpdates(prev => [
      ...prev,
      { habitId, date, retryCount: 0 }
    ]);
  }, []);

  const removeFailedUpdate = useCallback((habitId: string, date: string) => {
    setFailedUpdates(prev => 
      prev.filter(update => 
        !(update.habitId === habitId && update.date === date)
      )
    );
  }, []);

  const toggleHabit = useCallback(async (habitId: string, date: string) => {
    const targetDate = new Date(date);
    const now = new Date();

    if (isBefore(startOfDay(now), startOfDay(targetDate))) {
      toast.error("Cannot mark habits for future dates");
      return;
    }

    const toastId = toast.loading("Updating habit...");

    startTransition(async () => {
      try {
        addOptimisticHabit({ habitId, date });

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

        const result: ToggleHabitResponse = await response.json();
        
        if (result.success) {
          removeFailedUpdate(habitId, date);
          toast.success(
            result.entry?.completed 
              ? "Habit marked as complete" 
              : "Habit completion removed",
            { id: toastId }
          );
          
          router.refresh();
        } else {
          throw new Error(getErrorMessage(result.error));
        }
      } catch (error) {
        console.error("Error toggling habit:", error);
        addFailedUpdate(habitId, date);
        toast.error("Failed to update habit. Will retry automatically.", {
          id: toastId,
          duration: 3000,
        });
        
        router.refresh();
      }
    });
  }, [addOptimisticHabit, router, removeFailedUpdate, addFailedUpdate]);

  const retryFailedUpdates = useCallback(async () => {
    const now = new Date();
    const updates = failedUpdates.filter(update => 
      !isBefore(startOfDay(now), startOfDay(new Date(update.date)))
    );
    
    setFailedUpdates(updates);

    for (const update of updates) {
      if (update.retryCount < 3) {
        try {
          await toggleHabit(update.habitId, update.date);
        } catch (error) {
          setFailedUpdates(prev => [
            ...prev,
            { ...update, retryCount: update.retryCount + 1 }
          ]);
        }
      } else {
        toast.error(`Failed to update habit after multiple attempts. Please try again later.`);
        removeFailedUpdate(update.habitId, update.date);
      }
    }
  }, [failedUpdates, toggleHabit, removeFailedUpdate]);

  useEffect(() => {
    if (failedUpdates.length > 0) {
      const timer = setTimeout(retryFailedUpdates, 30000);
      return () => clearTimeout(timer);
    }
  }, [failedUpdates, retryFailedUpdates]);

  return (
    <OptimisticContext.Provider value={{ toggleHabit, isPending, retryFailedUpdates }}>
      {children}
      {failedUpdates.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          <p>Some updates failed to sync</p>
          <button 
            onClick={retryFailedUpdates}
            className="underline text-sm mt-1"
          >
            Retry now
          </button>
        </div>
      )}
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