// src/types/habit.d.ts

// Base types for database entities
export type HabitEntry = {
  id: string;
  date: string; // ISO string format
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  habitId: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  entries: HabitEntry[];
};

// API request types
export type CreateHabitRequest = {
  name: string;
  description: string;
  color?: string;
  icon?: string;
};

export type UpdateHabitRequest = {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  archived?: boolean;
};

export type CreateHabitEntry = {
  date: string;
  habitId: string;
};

export type UpdateHabitEntry = {
  completed: boolean;
};

// Statistics types
export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  daysTracked: number;
};

// View-specific types
export type HeatmapEntry = {
  date: string;
  intensity: number;
};

export type YearlyData = {
  year: number;
  entries: HeatmapEntry[];
};

// API response types
export type ToggleHabitResponse = {
  success: boolean;
  entry: HabitEntry | null;
  message?: string;
  error?: string;
};

export type FetchHabitResponse = {
  habit: Habit;
  stats: HabitStats;
};

export type CreateHabitResponse = {
  success: boolean;
  habit: Habit;
  error?: string;
};

export type UpdateHabitResponse = {
  success: boolean;
  habit: Habit;
  error?: string;
};

export type DeleteHabitResponse = {
  success: boolean;
  error?: string;
};

// Common API error type
export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};