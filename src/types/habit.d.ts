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

// Component Props types
export interface HabitCardProps {
  habit: Habit;
  onUpdate?: (id: string, data: Partial<Habit>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
}

export interface MonthlyViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  className?: string;
}

// View types
export type ViewMode = "weekly" | "monthly";

export interface DayData {
  date: Date;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture?: boolean;
}

// Monthly types
export interface MonthlyStats {
  month: string;
  completions: number;
  possibleDays: number;
  completionRate: number;
  longestStreak: number;
  totalDays: number;
}

export interface MonthData {
  date: Date;
  entries: HabitEntry[];
  stats: MonthlyStats;
}

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
export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  daysTracked: number;
  monthlyStats: MonthlyStats[];
  bestMonth: MonthlyStats | null;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  completed: number;
  month: string;
  isToday: boolean;
}

export interface MonthlyPerformanceData {
  month: string;
  completionRate: number;
  streak: number;
  totalDays: number;
  completedDays: number;
}

// API response types
export interface ToggleHabitResponse {
  success: boolean;
  entry: HabitEntry | null;
  message?: string;
  error?: string;
}

export interface FetchHabitResponse {
  habit: Habit;
  stats: HabitStats;
  monthlyStats: MonthlyStats[];
}

export interface CreateHabitResponse {
  success: boolean;
  habit: Habit;
  error?: string;
}

export interface UpdateHabitResponse {
  success: boolean;
  habit: Habit;
  error?: string;
}

export interface DeleteHabitResponse {
  success: boolean;
  error?: string;
}

// Common API error type
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Utility types
export type DateString = string; // ISO format
export type HabitId = string;
export type UserId = string;

// State management types
export interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
}

export interface OptimisticUpdateParams {
  habitId: string;
  date: string;
  completed: boolean;
}