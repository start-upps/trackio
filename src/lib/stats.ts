// src/lib/stats.ts
import { Habit } from "@/types/habit";
import { 
  isSameDay, 
  subDays, 
  // startOfMonth,
  // endOfMonth,
  // eachDayOfInterval,
  isSameMonth,
  // isToday,
  format,
  getDaysInMonth
} from "date-fns";

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  daysTracked: number;
  monthlyStats: MonthlyStats[];
  bestMonth: MonthlyStats | null;
}

export interface MonthlyStats {
  month: string;
  completions: number;
  possibleDays: number;
  completionRate: number;
  longestStreak: number;
  totalDays: number;
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

  // Calculate monthly stats
  const monthlyStats: MonthlyStats[] = [];
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  for (let month = sixMonthsAgo; month <= today; month = new Date(month.getFullYear(), month.getMonth() + 1, 1)) {
    // const monthStart = startOfMonth(month);
    // const monthEnd = endOfMonth(month);
    const daysInMonth = getDaysInMonth(month);
    const isCurrentMonth = isSameMonth(month, today);

    // For current month, only count days up to today
    const possibleDays = isCurrentMonth ? today.getDate() : daysInMonth;

    const monthEntries = entries.filter(entry => 
      isSameMonth(entry.date, month) && 
      entry.date <= today
    );

    const completions = monthEntries.filter(e => e.completed).length;

    // Calculate monthly streak
    let monthLongestStreak = 0;
    let monthTempStreak = 0;
    let monthLastDate: Date | null = null;

    monthEntries
      .filter(e => e.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .forEach((entry) => {
        if (!monthLastDate || isSameDay(subDays(monthLastDate, 1), entry.date)) {
          monthTempStreak++;
        } else {
          monthTempStreak = 1;
        }
        monthLongestStreak = Math.max(monthLongestStreak, monthTempStreak);
        monthLastDate = entry.date;
      });

    monthlyStats.push({
      month: format(month, 'MMM yyyy'),
      completions,
      possibleDays,
      completionRate: Math.round((completions / possibleDays) * 100),
      longestStreak: monthLongestStreak,
      totalDays: daysInMonth
    });
  }

  // Find best month
  const bestMonth = monthlyStats.reduce((best, current) => {
    if (!best || current.completionRate > best.completionRate) {
      return current;
    }
    return best;
  }, null as MonthlyStats | null);

  // Calculate overall stats
  const daysTracked = entries.length;
  const completions = entries.filter((e) => e.completed).length;
  const completionRate = daysTracked ? (completions / daysTracked) * 100 : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate: Math.round(completionRate),
    totalCompletions: completions,
    daysTracked,
    monthlyStats,
    bestMonth
  };
}

// Utility function to calculate stats for specific month
export function calculateMonthStats(
  habit: Habit, 
  month: Date
): MonthlyStats {
  const entries = habit.entries
    .map(entry => ({
      ...entry,
      date: new Date(entry.date)
    }))
    .filter(entry => isSameMonth(entry.date, month));

  const daysInMonth = getDaysInMonth(month);
  const isCurrentMonth = isSameMonth(month, new Date());
  const possibleDays = isCurrentMonth ? new Date().getDate() : daysInMonth;
  
  const completions = entries.filter(e => e.completed).length;

  // Calculate monthly streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  entries
    .filter(e => e.completed)
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

  return {
    month: format(month, 'MMM yyyy'),
    completions,
    possibleDays,
    completionRate: Math.round((completions / possibleDays) * 100),
    longestStreak,
    totalDays: daysInMonth
  };
}