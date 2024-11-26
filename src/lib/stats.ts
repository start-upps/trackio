// src/lib/stats.ts
import { Habit, HabitEntry } from "@/types/habit";
import { format, isToday, isSameDay, subDays } from "date-fns";

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  daysTracked: number;
}

export function calculateHabitStats(habit: Habit): HabitStats {
  const entries = habit.entries.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));

  // Calculate current streak
  let currentStreak = 0;
  let date = new Date();

  while (true) {
    const entry = entries.find((e) => isSameDay(e.date, date));
    if (!entry?.completed) break;
    currentStreak++;
    date = subDays(date, 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  entries
    .filter((e) => e.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .forEach((entry) => {
      if (!lastDate || isSameDay(subDays(lastDate, 1), entry.date)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = entry.date;
    });

  // Calculate completion rate
  const daysTracked = entries.length;
  const completions = entries.filter((e) => e.completed).length;
  const completionRate = daysTracked ? (completions / daysTracked) * 100 : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate: Math.round(completionRate),
    totalCompletions: completions,
    daysTracked,
  };
}
