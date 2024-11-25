// src/types/habit.d.ts
export type HabitEntry = {
  id: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  habitId: string;
}

export type Habit = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  entries: HabitEntry[];
}