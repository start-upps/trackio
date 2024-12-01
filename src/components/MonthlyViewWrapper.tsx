// src/components/MonthlyViewWrapper.tsx
"use client";

import { OptimisticProvider } from "./providers/OptimisticProvider";
import MonthlyView from "./MonthlyHabitTracker";
import { useOptimisticHabits } from "./providers/OptimisticProvider";
import type { Habit } from "@/types/habit";

function MonthlyViewWithOptimistic({ habits }: { habits: Habit[] }) {
  const { toggleHabit } = useOptimisticHabits();
  
  return (
    <MonthlyView 
      habits={habits}
      onToggleHabit={toggleHabit}
    />
  );
}

export function MonthlyViewWrapper({ habits }: { habits: Habit[] }) {
  return (
    <OptimisticProvider habits={habits}>
      <MonthlyViewWithOptimistic habits={habits} />
    </OptimisticProvider>
  );
}